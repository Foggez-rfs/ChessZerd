// www/app.js
(function() {
    'use strict';

    // Глобальные ссылки на модули
    const B = window.BitboardCore;
    const State = window.BoardState;
    const Game = window.GameState;
    const Validator = window.MoveValidator;
    const Check = window.CheckDetector;
    const Draw = window.DrawDetector;

    let selectedPiece = -1;
    let validMoves = [];
    let playerColor = 0;
    let gameActive = false;
    let currentTheme = 'wood';
    let currentStyle = 'neo';
    let language = 'ru';
    let playerName = 'Игрок';
    let playerAvatar = 0;
    let playerElo = 1200;
    let wins = 0, losses = 0, draws = 0;

    const AVATARS = [/* base64 уже в HTML, но оставим для совместимости */];
    const AIZEN_QUOTES = {
        ru: [
            "Добро пожаловать в мой мир. Здесь я устанавливаю правила.",
            "Твои ходы предсказуемы. Но продолжай, это забавно.",
            "Шахматы — это не игра. Это отражение души.",
            "Ты думаешь, что контролируешь доску? Интересно.",
            "Каждая твоя ошибка делает меня сильнее.",
            "Я вижу твой следующий ход. И следующий за ним.",
            "Ты уже проиграл, просто ещё не осознал этого.",
            "Моя сила — не в расчётах, а в понимании."
        ],
        en: [/* ... */]
    };

    function init() {
        loadProfile();
        loadTheme();
        loadStyle();
        loadLanguage();
        setupBoard();
        setupEventListeners();
        showWelcomeMessage();
        startNewGame();
    }

    function loadProfile() {
        const profile = JSON.parse(localStorage.getItem('chesszerd_profile') || '{}');
        playerName = profile.name || 'Игрок';
        playerAvatar = profile.avatar || 0;
        playerElo = profile.elo || 1200;
        wins = profile.wins || 0; losses = profile.losses || 0; draws = profile.draws || 0;
        document.getElementById('playerName').value = playerName;
        document.getElementById('playerElo').textContent = playerElo;
        document.getElementById('playerWins').textContent = wins;
        document.getElementById('playerLosses').textContent = losses;
        document.getElementById('playerDraws').textContent = draws;
    }

    function saveProfile() {
        const profile = { name: playerName, avatar: playerAvatar, elo: playerElo, wins, losses, draws };
        localStorage.setItem('chesszerd_profile', JSON.stringify(profile));
    }

    function loadTheme() {
        currentTheme = localStorage.getItem('chesszerd_theme') || 'wood';
        document.querySelectorAll('.theme-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.theme === currentTheme));
        applyTheme();
    }

    function loadStyle() {
        currentStyle = localStorage.getItem('chesszerd_style') || 'neo';
        document.querySelectorAll('.style-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.styleName === currentStyle));
        applyStyle();
    }

    function loadLanguage() {
        language = localStorage.getItem('chesszerd_lang') || 'ru';
        document.querySelectorAll('.lang-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.lang === language));
        updateUILanguage();
    }

    function setupBoard() {
        const boardEl = document.getElementById('board');
        boardEl.innerHTML = '';
        for (let i = 0; i < 64; i++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.dataset.index = i;
            const row = Math.floor(i / 8), col = i % 8;
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            square.addEventListener('click', () => onSquareClick(i));
            square.addEventListener('touchstart', (e) => { e.preventDefault(); onSquareClick(i); });
            boardEl.appendChild(square);
        }
        updateBoard();
    }

    function updateBoard() {
        const board = State.getBoard();
        const squares = document.querySelectorAll('.square');
        squares.forEach(sq => {
            const idx = parseInt(sq.dataset.index);
            sq.textContent = board[idx] || '';
            sq.classList.remove('selected', 'valid-move', 'capture-move');
        });
        if (selectedPiece >= 0) {
            squares[selectedPiece].classList.add('selected');
            validMoves.forEach(m => {
                const target = squares[m.to];
                if (m.capture || m.enPassant) target.classList.add('capture-move');
                else target.classList.add('valid-move');
            });
        }
        updateStatus();
    }

    function onSquareClick(index) {
        if (!gameActive || Game.isGameOver()) return;
        const board = State.getBoard();
        const piece = board[index];
        const color = State.getColorAt(index);

        if (selectedPiece === -1) {
            if (piece && color === playerColor) {
                selectedPiece = index;
                validMoves = Validator.getLegalMoves(State.getState(), index);
                updateBoard();
                playSelectSound();
            }
        } else if (index === selectedPiece) {
            selectedPiece = -1;
            validMoves = [];
            updateBoard();
        } else if (validMoves.some(m => m.to === index)) {
            const move = validMoves.find(m => m.to === index);
            executePlayerMove(move);
        } else if (piece && color === playerColor) {
            selectedPiece = index;
            validMoves = Validator.getLegalMoves(State.getState(), index);
            updateBoard();
            playSelectSound();
        }
    }

    function executePlayerMove(move) {
        // Превращение пешки
        const board = State.getBoard();
        const piece = board[move.from];
        if ((piece === '♙' && Math.floor(move.to / 8) === 0) || (piece === '♟' && Math.floor(move.to / 8) === 7)) {
            const choice = prompt((language === 'ru' ? 'Выберите фигуру (♕♖♗♘):' : 'Choose piece (♕♖♗♘):'), '♕');
            if (!choice || !'♕♖♗♘♛♜♝♞'.includes(choice)) return;
            move.promotion = choice;
        }
        State.makeMove(move);
        if (move.promotion) {
            State.getBoard()[move.to] = move.promotion;
        }
        selectedPiece = -1;
        validMoves = [];
        updateBoard();
        playMoveSound();
        Game.updateResult(State);
        if (Game.isGameOver()) {
            handleGameEnd();
            return;
        }
        // Ход ИИ
        setTimeout(makeAIMove, 500);
    }

    function makeAIMove() {
        if (State.getActiveColor() !== (1 - playerColor)) return;
        const depth = calcDepth();
        const best = window.searchBestMove(State.getState(), depth);
        if (!best) { handleGameEnd(); return; }
        // Превращение для ИИ
        const board = State.getBoard();
        const piece = board[best.from];
        if ((piece === '♙' && Math.floor(best.to / 8) === 0) || (piece === '♟' && Math.floor(best.to / 8) === 7)) {
            best.promotion = playerColor === 0 ? '♛' : '♕';
        }
        State.makeMove(best);
        if (best.promotion) board[best.to] = best.promotion;
        updateBoard();
        playMoveSound();
        speakAIMessage();
        Game.updateResult(State);
        if (Game.isGameOver()) handleGameEnd();
    }

    function calcDepth() {
        if (playerElo < 1000) return 1;
        if (playerElo < 1400) return 2;
        if (playerElo < 1800) return 3;
        return 4;
    }

    function handleGameEnd() {
        gameActive = false;
        const result = Game.getResult();
        if (result === '1-0') {
            if (playerColor === 0) { wins++; playerElo += 20; } else { losses++; playerElo -= 20; }
        } else if (result === '0-1') {
            if (playerColor === 1) { wins++; playerElo += 20; } else { losses++; playerElo -= 20; }
        } else { draws++; }
        playerElo = Math.max(100, playerElo);
        saveProfile(); loadProfile();
        updateBoard();
        showGameResult();
        showRandomQuote();
    }

    function startNewGame() {
        State.reset();
        Game.reset();
        selectedPiece = -1;
        validMoves = [];
        gameActive = true;
        if (playerColor === 1) {
            updateBoard();
            setTimeout(makeAIMove, 1000);
        } else {
            updateBoard();
        }
        showRandomQuote();
    }

    function undoLastMove() {
        if (!gameActive || State.getHistoryLength() < 2) return;
        State.undoMove(); // ход ИИ
        State.undoMove(); // ход игрока
        Game.updateResult(State);
        selectedPiece = -1;
        validMoves = [];
        updateBoard();
    }

    function flipBoard() {
        document.getElementById('board').classList.toggle('flipped');
    }

    function setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', startNewGame);
        document.getElementById('undoBtn').addEventListener('click', undoLastMove);
        document.getElementById('flipBtn').addEventListener('click', flipBoard);
        document.getElementById('saveProfileBtn').addEventListener('click', () => {
            playerName = document.getElementById('playerName').value || 'Игрок';
            saveProfile(); loadProfile();
            alert(language === 'ru' ? 'Профиль сохранён!' : 'Profile saved!');
        });
        // Вкладки
        document.querySelectorAll('.tab-btn').forEach(b => {
            b.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(x => x.classList.add('hidden'));
                b.classList.add('active');
                document.getElementById(b.dataset.tab + 'Tab').classList.remove('hidden');
            });
        });
        document.querySelectorAll('.theme-btn').forEach(b => b.addEventListener('click', () => {
            currentTheme = b.dataset.theme; localStorage.setItem('chesszerd_theme', currentTheme); loadTheme();
        }));
        document.querySelectorAll('.style-btn').forEach(b => b.addEventListener('click', () => {
            currentStyle = b.dataset.styleName; localStorage.setItem('chesszerd_style', currentStyle); loadStyle();
        }));
        document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => {
            language = b.dataset.lang; localStorage.setItem('chesszerd_lang', language); loadLanguage();
        }));
        document.getElementById('googleLoginBtn').addEventListener('click', loginWithGoogle);
        document.getElementById('chesscomBtn').addEventListener('click', importFromChessCom);
    }

    function applyTheme() {
        const root = document.documentElement;
        switch(currentTheme) {
            case 'wood': root.style.setProperty('--light-square', '#f0d9b5'); root.style.setProperty('--dark-square', '#b58863'); root.style.setProperty('--accent', '#c8a96e'); break;
            case 'classic': root.style.setProperty('--light-square', '#ffce9e'); root.style.setProperty('--dark-square', '#d18b47'); root.style.setProperty('--accent', '#e8ab6e'); break;
            case 'night': root.style.setProperty('--light-square', '#1a1a2e'); root.style.setProperty('--dark-square', '#0f0f1a'); root.style.setProperty('--accent', '#4a4a8e'); break;
            case 'neon': root.style.setProperty('--light-square', '#1a0033'); root.style.setProperty('--dark-square', '#0d001a'); root.style.setProperty('--accent', '#ff00ff'); break;
        }
        updateBoard();
    }

    function applyStyle() {
        const boardEl = document.getElementById('board');
        boardEl.classList.remove('style-neo', 'style-standard', 'style-minimal');
        boardEl.classList.add('style-' + currentStyle);
        updateBoard();
    }

    function updateUILanguage() {
        const t = {
            ru: { newGame: 'Новая игра', undo: 'Отменить', flip: 'Перевернуть', save: 'Сохранить', game: 'Игра', profile: 'Профиль', style: 'Стиль', loginGoogle: 'Войти через Google', importChesscom: 'Импорт с Chess.com' },
            en: { newGame: 'New Game', undo: 'Undo', flip: 'Flip', save: 'Save', game: 'Game', profile: 'Profile', style: 'Style', loginGoogle: 'Login with Google', importChesscom: 'Import from Chess.com' }
        };
        const p = t[language];
        document.getElementById('newGameBtn').textContent = p.newGame;
        document.getElementById('undoBtn').textContent = p.undo;
        document.getElementById('flipBtn').textContent = p.flip;
        document.getElementById('saveProfileBtn').textContent = p.save;
        document.querySelectorAll('.tab-btn')[0].textContent = p.game;
        document.querySelectorAll('.tab-btn')[1].textContent = p.profile;
        document.querySelectorAll('.tab-btn')[2].textContent = p.style;
        document.getElementById('googleLoginBtn').textContent = p.loginGoogle;
        document.getElementById('chesscomBtn').textContent = p.importChesscom;
        updateStatus();
    }

    function updateStatus() {
        const st = document.getElementById('status');
        if (!Game.isGameOver()) {
            st.textContent = State.getActiveColor() === playerColor ? (language === 'ru' ? 'Ваш ход' : 'Your move') : (language === 'ru' ? 'Ход Сосуке Айзена...' : 'Sosuke Aizen\'s move...');
        } else {
            const res = Game.getResult();
            if (res === '1/2-1/2') st.textContent = language === 'ru' ? 'Ничья!' : 'Draw!';
            else if ((res === '1-0' && playerColor === 0) || (res === '0-1' && playerColor === 1)) st.textContent = language === 'ru' ? 'Вы победили!' : 'You won!';
            else st.textContent = language === 'ru' ? 'Айзен победил!' : 'Aizen won!';
        }
    }

    function showGameResult() { updateStatus(); }
    function showRandomQuote() {
        const quotes = AIZEN_QUOTES[language] || AIZEN_QUOTES.ru;
        document.getElementById('aizenQuote').textContent = quotes[Math.floor(Math.random() * quotes.length)];
    }
    function showWelcomeMessage() {
        setTimeout(() => {
            const w = document.getElementById('welcomeScreen');
            if (w) { w.style.opacity = '0'; setTimeout(() => w.remove(), 1000); }
        }, 2000);
    }
    function speakAIMessage() {
        if ('speechSynthesis' in window) {
            const quotes = AIZEN_QUOTES[language] || AIZEN_QUOTES.ru;
            const u = new SpeechSynthesisUtterance(quotes[Math.floor(Math.random()*quotes.length)]);
            u.lang = language==='ru'?'ru-RU':'en-US'; u.rate=0.9; u.pitch=0.8;
            speechSynthesis.speak(u);
        }
    }
    function playMoveSound() { try { const a=new (window.AudioContext||window.webkitAudioContext)(); const o=a.createOscillator(); const g=a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value=800; o.type='sine'; g.gain.value=0.1; o.start(); g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.1); o.stop(a.currentTime+0.1); } catch(e){} }
    function playSelectSound() { try { const a=new (window.AudioContext||window.webkitAudioContext)(); const o=a.createOscillator(); const g=a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value=600; o.type='sine'; g.gain.value=0.05; o.start(); g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.05); o.stop(a.currentTime+0.05); } catch(e){} }
    function loginWithGoogle() { alert('Google OAuth не настроен'); }
    function importFromChessCom() { const name=prompt('Введите имя пользователя Chess.com:'); if(name) fetch(`https://api.chess.com/pub/player/${name}`).then(r=>r.json()).then(d=>{ playerName=d.username||name; document.getElementById('playerName').value=playerName; saveProfile(); loadProfile(); }).catch(()=>{ alert('Ошибка подключения'); }); }

    window.addEventListener('DOMContentLoaded', init);
})();
