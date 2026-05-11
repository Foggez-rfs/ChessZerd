(function() {
    'use strict';

    const State = window.BoardState;
    const Game = window.GameState;
    const Validator = window.MoveValidator;
    const B = window.BitboardCore;

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

    const AIZEN_QUOTES = {
        ru: ["Добро пожаловать в мой мир. Здесь я устанавливаю правила.","Твои ходы предсказуемы.","Каждая твоя ошибка делает меня сильнее."],
        en: ["Welcome to my world.","Your moves are predictable.","Every mistake you make strengthens me."]
    };

    function init() {
        loadProfile();
        loadTheme();
        loadStyle();
        loadLanguage();
        setupBoard();
        setupEventListeners();
        showWelcome();
        startNewGame();
    }

    function loadProfile() {
        const p = JSON.parse(localStorage.getItem('chesszerd_profile') || '{}');
        playerName = p.name || 'Игрок';
        playerElo = p.elo || 1200;
        wins = p.wins || 0; losses = p.losses || 0; draws = p.draws || 0;
        document.getElementById('playerName').value = playerName;
        document.getElementById('playerElo').textContent = playerElo;
        document.getElementById('playerWins').textContent = wins;
        document.getElementById('playerLosses').textContent = losses;
        document.getElementById('playerDraws').textContent = draws;
    }

    function saveProfile() {
        localStorage.setItem('chesszerd_profile', JSON.stringify({
            name: playerName, avatar: playerAvatar, elo: playerElo, wins, losses, draws
        }));
    }

    function loadTheme() {
        currentTheme = localStorage.getItem('chesszerd_theme') || 'wood';
        document.querySelectorAll('.theme-btn').forEach(b => b.classList.toggle('active', b.dataset.theme === currentTheme));
        applyTheme();
    }

    function loadStyle() {
        currentStyle = localStorage.getItem('chesszerd_style') || 'neo';
        document.querySelectorAll('.style-btn').forEach(b => b.classList.toggle('active', b.dataset.styleName === currentStyle));
        applyStyle();
    }

    function loadLanguage() {
        language = localStorage.getItem('chesszerd_lang') || 'ru';
        document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === language));
        updateUILanguage();
    }

    function setupBoard() {
        const boardEl = document.getElementById('board');
        boardEl.innerHTML = '';
        for (let i = 0; i < 64; i++) {
            const sq = document.createElement('div');
            sq.className = 'square';
            sq.dataset.index = i;
            const row = Math.floor(i / 8), col = i % 8;
            sq.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            sq.addEventListener('click', () => onSquareClick(i));
            sq.addEventListener('touchstart', (e) => { e.preventDefault(); onSquareClick(i); });
            boardEl.appendChild(sq);
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
        const color = State.getColorAt(index);
        const piece = State.getBoard()[index];

        if (selectedPiece === -1) {
            if (piece && color === playerColor) {
                selectedPiece = index;
                validMoves = Validator.getLegalMoves(State.getState(), index);
                updateBoard();
                playSelectSound();
            }
        } else if (index === selectedPiece) {
            selectedPiece = -1; validMoves = []; updateBoard();
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
        const board = State.getBoard();
        const piece = board[move.from];
        if ((piece === '♙' && Math.floor(move.to / 8) === 0) || (piece === '♟' && Math.floor(move.to / 8) === 7)) {
            const choice = prompt(language === 'ru' ? 'Выберите фигуру (♕♖♗♘):' : 'Choose piece (♕♖♗♘):', '♕');
            if (!choice || !'♕♖♗♘♛♜♝♞'.includes(choice)) return;
            move.promotion = choice;
        }
        State.makeMove(move);
        if (move.promotion) State.getBoard()[move.to] = move.promotion;
        selectedPiece = -1; validMoves = [];
        updateBoard();
        playMoveSound();
        Game.updateResult(State);
        if (Game.isGameOver()) { handleGameEnd(); return; }
        setTimeout(makeAIMove, 400);
    }

    function makeAIMove() {
        if (State.getActiveColor() !== 1 - playerColor) return;
        const depth = Math.min(4, Math.floor(playerElo / 500) + 1);
        const best = window.searchBestMove(State.getState(), depth);
        if (!best) { handleGameEnd(); return; }
        const board = State.getBoard();
        const piece = board[best.from];
        if ((piece === '♙' && Math.floor(best.to / 8) === 0) || (piece === '♟' && Math.floor(best.to / 8) === 7)) {
            best.promotion = playerColor === 0 ? '♛' : '♕';
        }
        State.makeMove(best);
        if (best.promotion) State.getBoard()[best.to] = best.promotion;
        updateBoard();
        playMoveSound();
        Game.updateResult(State);
        if (Game.isGameOver()) handleGameEnd();
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
        showRandomQuote();
    }

    function startNewGame() {
        State.reset();
        Game.reset();
        selectedPiece = -1; validMoves = [];
        gameActive = true;
        if (playerColor === 1) {
            updateBoard();
            setTimeout(makeAIMove, 800);
        } else {
            updateBoard();
        }
        showRandomQuote();
    }

    function undoLastMove() {
        if (State.getHistoryLength() < 2) return;
        State.undoMove(); State.undoMove();
        selectedPiece = -1; validMoves = [];
        Game.updateResult(State);
        updateBoard();
    }

    function applyTheme() {
        const root = document.documentElement;
        switch(currentTheme) {
            case 'wood': root.style.setProperty('--light-square','#f0d9b5'); root.style.setProperty('--dark-square','#b58863'); root.style.setProperty('--accent','#c8a96e'); break;
            case 'classic': root.style.setProperty('--light-square','#ffce9e'); root.style.setProperty('--dark-square','#d18b47'); root.style.setProperty('--accent','#e8ab6e'); break;
            case 'night': root.style.setProperty('--light-square','#1a1a2e'); root.style.setProperty('--dark-square','#0f0f1a'); root.style.setProperty('--accent','#4a4a8e'); break;
            case 'neon': root.style.setProperty('--light-square','#1a0033'); root.style.setProperty('--dark-square','#0d001a'); root.style.setProperty('--accent','#ff00ff'); break;
        }
        updateBoard();
    }

    function applyStyle() {
        const boardEl = document.getElementById('board');
        boardEl.classList.remove('style-neo','style-standard','style-minimal');
        boardEl.classList.add('style-' + currentStyle);
        updateBoard();
    }

    function setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', startNewGame);
        document.getElementById('undoBtn').addEventListener('click', undoLastMove);
        document.getElementById('flipBtn').addEventListener('click', () => {
            document.getElementById('board').classList.toggle('flipped');
        });
        document.getElementById('saveProfileBtn').addEventListener('click', () => {
            playerName = document.getElementById('playerName').value.trim() || 'Игрок';
            saveProfile(); loadProfile();
            alert(language === 'ru' ? 'Профиль сохранён!' : 'Profile saved!');
        });
        document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(x => x.classList.add('hidden'));
            this.classList.add('active');
            document.getElementById(this.dataset.tab + 'Tab').classList.remove('hidden');
        }));
        document.querySelectorAll('.theme-btn').forEach(b => b.addEventListener('click', function() {
            currentTheme = this.dataset.theme; localStorage.setItem('chesszerd_theme', currentTheme); loadTheme();
        }));
        document.querySelectorAll('.style-btn').forEach(b => b.addEventListener('click', function() {
            currentStyle = this.dataset.styleName; localStorage.setItem('chesszerd_style', currentStyle); loadStyle();
        }));
        document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', function() {
            language = this.dataset.lang; localStorage.setItem('chesszerd_lang', language); loadLanguage();
        }));
    }

    function updateUILanguage() {
        const t = {
            ru: { newGame: 'Новая игра', undo: 'Отменить', flip: 'Перевернуть', save: 'Сохранить' },
            en: { newGame: 'New Game', undo: 'Undo', flip: 'Flip', save: 'Save' }
        }[language];
        document.getElementById('newGameBtn').textContent = t.newGame;
        document.getElementById('undoBtn').textContent = t.undo;
        document.getElementById('flipBtn').textContent = t.flip;
        document.getElementById('saveProfileBtn').textContent = t.save;
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

    function showRandomQuote() {
        const quotes = AIZEN_QUOTES[language];
        document.getElementById('aizenQuote').textContent = quotes[Math.floor(Math.random() * quotes.length)];
    }

    function showWelcome() {
        const w = document.getElementById('welcomeScreen');
        if (w) { setTimeout(() => { w.style.opacity = '0'; setTimeout(() => w.remove(), 1000); }, 2000); }
    }

    function playMoveSound() { try { const a=new (window.AudioContext||window.webkitAudioContext)(); const o=a.createOscillator(); const g=a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value=800; o.type='sine'; g.gain.value=0.1; o.start(); g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.1); o.stop(a.currentTime+0.1); } catch(e){} }
    function playSelectSound() { try { const a=new (window.AudioContext||window.webkitAudioContext)(); const o=a.createOscillator(); const g=a.createGain(); o.connect(g); g.connect(a.destination); o.frequency.value=600; o.type='sine'; g.gain.value=0.05; o.start(); g.gain.exponentialRampToValueAtTime(0.001,a.currentTime+0.05); o.stop(a.currentTime+0.05); } catch(e){} }

    window.addEventListener('DOMContentLoaded', init);
})();
