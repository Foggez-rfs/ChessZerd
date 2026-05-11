// app.js - UI и управление Chesszerd
(function() {
    'use strict';
    
    let engine = null;
    let selectedPiece = -1;
    let validMoves = [];
    let playerColor = 0; // 0 - белые
    let gameActive = false;
    let currentTheme = 'wood';
    let currentStyle = 'neo';
    let language = 'ru';
    let playerName = 'Игрок';
    let playerAvatar = 0;
    let playerElo = 1200;
    let wins = 0;
    let losses = 0;
    let draws = 0;
    
    // Аватары base64
    const AVATARS = [
        'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIzMiIgY3k9IjMyIiByPSIzMCIgZmlsbD0iI2M4YTk2ZSIvPjx0ZXh0IHg9IjMyIiB5PSI0MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0id2hpdGUiIGZvbnQtc2l6ZT0iMjgiPuKfqTwvdGV4dD48L3N2Zz4=',
        'data:image/svg+xml;base64,' + btoa('<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#b58863"/><text x="32" y="40" text-anchor="middle" fill="white" font-size="28">♛</text></svg>'),
        'data:image/svg+xml;base64,' + btoa('<svg width="64" height="64" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg"><circle cx="32" cy="32" r="30" fill="#769656"/><text x="32" y="40" text-anchor="middle" fill="white" font-size="28">♚</text></svg>')
    ];
    
    // Цитаты Айзена
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
        en: [
            "Welcome to my world. I set the rules here.",
            "Your moves are predictable. But continue, it's amusing.",
            "Chess is not a game. It's a reflection of the soul.",
            "You think you control the board? Interesting.",
            "Every mistake you make strengthens me.",
            "I see your next move. And the one after that.",
            "You've already lost, you just haven't realized it yet.",
            "My strength is not in calculation, but in understanding."
        ]
    };
    
    function init() {
        engine = window.createEngine();
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
        wins = profile.wins || 0;
        losses = profile.losses || 0;
        draws = profile.draws || 0;
        
        document.getElementById('playerName').value = playerName;
        document.getElementById('playerElo').textContent = playerElo;
        document.getElementById('playerWins').textContent = wins;
        document.getElementById('playerLosses').textContent = losses;
        document.getElementById('playerDraws').textContent = draws;
    }
    
    function saveProfile() {
        const profile = {
            name: playerName,
            avatar: playerAvatar,
            elo: playerElo,
            wins: wins,
            losses: losses,
            draws: draws
        };
        localStorage.setItem('chesszerd_profile', JSON.stringify(profile));
    }
    
    function loadTheme() {
        currentTheme = localStorage.getItem('chesszerd_theme') || 'wood';
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.theme === currentTheme);
        });
        applyTheme();
    }
    
    function loadStyle() {
        currentStyle = localStorage.getItem('chesszerd_style') || 'neo';
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.styleName === currentStyle);
        });
        applyStyle();
    }
    
    function loadLanguage() {
        language = localStorage.getItem('chesszerd_lang') || 'ru';
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.lang === language);
        });
        updateUILanguage();
    }
    
    function setupBoard() {
        const board = document.getElementById('board');
        board.innerHTML = '';
        
        for (let i = 0; i < 64; i++) {
            const square = document.createElement('div');
            square.className = 'square';
            square.dataset.index = i;
            
            const row = Math.floor(i / 8);
            const col = i % 8;
            square.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            
            square.addEventListener('click', () => onSquareClick(i));
            square.addEventListener('touchstart', (e) => {
                e.preventDefault();
                onSquareClick(i);
            });
            
            board.appendChild(square);
        }
        
        updateBoard();
    }
    
    function updateBoard() {
        const squares = document.querySelectorAll('.square');
        squares.forEach(square => {
            const index = parseInt(square.dataset.index);
            const piece = engine.getPieceAt(index);
            square.textContent = piece || '';
            square.classList.remove('selected', 'valid-move', 'capture-move');
        });
        
        if (selectedPiece >= 0) {
            squares[selectedPiece].classList.add('selected');
            validMoves.forEach(move => {
                const targetSquare = squares[move.to];
                if (move.capture || move.enPassant) {
                    targetSquare.classList.add('capture-move');
                } else {
                    targetSquare.classList.add('valid-move');
                }
            });
        }
        
        updateStatus();
    }
    
    function onSquareClick(index) {
        if (!gameActive || engine.gameOver) return;
        
        const piece = engine.getPieceAt(index);
        const color = engine.getColorAt(index);
        
        if (selectedPiece === -1) {
            // Выбор фигуры
            if (piece && color === playerColor) {
                selectedPiece = index;
                validMoves = engine.getValidMoves(index);
                updateBoard();
                playSelectSound();
            }
        } else if (index === selectedPiece) {
            // Отмена выбора
            selectedPiece = -1;
            validMoves = [];
            updateBoard();
        } else if (validMoves.some(m => m.to === index)) {
            // Выполнение хода
            const move = validMoves.find(m => m.to === index);
            executePlayerMove(move);
        } else if (piece && color === playerColor) {
            // Выбор другой фигуры
            selectedPiece = index;
            validMoves = engine.getValidMoves(index);
            updateBoard();
            playSelectSound();
        }
    }
    
    function executePlayerMove(move) {
        // Проверка превращения пешки
        const piece = engine.board[move.from];
        let promotionPiece = '';
        
        if ((piece === '♙' && Math.floor(move.to / 8) === 0) || 
            (piece === '♟' && Math.floor(move.to / 8) === 7)) {
            promotionPiece = prompt(
                language === 'ru' ? 'Выберите фигуру (♕♖♗♘):' : 'Choose piece (♕♖♗♘):',
                language === 'ru' ? '♕' : '♕'
            );
            if (!promotionPiece || !'♕♖♗♘♛♜♝♞'.includes(promotionPiece)) {
                return;
            }
            move.promotion = promotionPiece;
        }
        
        engine.makeMove(move);
        
        // Выполнение превращения
        if (move.promotion) {
            engine.board[move.to] = move.promotion;
        }
        
        selectedPiece = -1;
        validMoves = [];
        updateBoard();
        playMoveSound();
        
        if (engine.gameOver) {
            handleGameEnd();
            return;
        }
        
        // Ход ИИ
        setTimeout(() => {
            makeAIMove();
        }, 500);
    }
    
    function makeAIMove() {
        const aiColor = 1 - playerColor;
        if (engine.currentPlayer !== aiColor) return;
        
        const depth = calculateAIDepth();
        const bestMove = engine.findBestMove(depth);
        
        if (!bestMove) {
            handleGameEnd();
            return;
        }
        
        // Проверка превращения пешки для ИИ
        const piece = engine.board[bestMove.from];
        if ((piece === '♙' && Math.floor(bestMove.to / 8) === 0) || 
            (piece === '♟' && Math.floor(bestMove.to / 8) === 7)) {
            bestMove.promotion = playerColor === 0 ? '♛' : '♕';
        }
        
        engine.makeMove(bestMove);
        
        if (bestMove.promotion) {
            engine.board[bestMove.to] = bestMove.promotion;
        }
        
        updateBoard();
        playMoveSound();
        speakAIMessage();
        
        if (engine.gameOver) {
            handleGameEnd();
        }
    }
    
    function calculateAIDepth() {
        if (playerElo < 1000) return 1;
        if (playerElo < 1400) return 2;
        if (playerElo < 1800) return 3;
        if (playerElo < 2200) return 4;
        return 5;
    }
    
    function handleGameEnd() {
        gameActive = false;
        
        if (engine.result === '1-0') {
            if (playerColor === 0) {
                wins++;
                playerElo += 20;
            } else {
                losses++;
                playerElo -= 20;
            }
        } else if (engine.result === '0-1') {
            if (playerColor === 1) {
                wins++;
                playerElo += 20;
            } else {
                losses++;
                playerElo -= 20;
            }
        } else {
            draws++;
        }
        
        playerElo = Math.max(100, playerElo);
        saveProfile();
        loadProfile();
        
        updateBoard();
        showGameResult();
        showRandomQuote();
    }
    
    function startNewGame() {
        engine.reset();
        selectedPiece = -1;
        validMoves = [];
        gameActive = true;
        
        if (playerColor === 1) {
            // Игрок играет чёрными, ИИ ходит первым
            updateBoard();
            setTimeout(() => makeAIMove(), 1000);
        } else {
            updateBoard();
        }
        
        updateBoard();
        showRandomQuote();
    }
    
    function undoLastMove() {
        if (!gameActive) return;
        
        // Отменяем ход ИИ и ход игрока
        engine.undoMove(); // Ход ИИ
        engine.undoMove(); // Ход игрока
        
        selectedPiece = -1;
        validMoves = [];
        updateBoard();
    }
    
    function updateStatus() {
        const statusEl = document.getElementById('status');
        if (!engine.gameOver) {
            statusEl.textContent = engine.currentPlayer === playerColor ? 
                (language === 'ru' ? 'Ваш ход' : 'Your move') :
                (language === 'ru' ? 'Ход Сосуке Айзена...' : 'Sosuke Aizen\'s move...');
        } else {
            if (engine.result === '1/2-1/2') {
                statusEl.textContent = language === 'ru' ? 'Ничья!' : 'Draw!';
            } else if ((engine.result === '1-0' && playerColor === 0) || 
                       (engine.result === '0-1' && playerColor === 1)) {
                statusEl.textContent = language === 'ru' ? 'Вы победили!' : 'You won!';
            } else {
                statusEl.textContent = language === 'ru' ? 'Айзен победил!' : 'Aizen won!';
            }
        }
    }
    
    function showGameResult() {
        const statusEl = document.getElementById('status');
        if (engine.result === '1/2-1/2') {
            statusEl.textContent = language === 'ru' ? 'Ничья!' : 'Draw!';
        } else if ((engine.result === '1-0' && playerColor === 0) || 
                   (engine.result === '0-1' && playerColor === 1)) {
            statusEl.textContent = language === 'ru' ? 'Поздравляю, вы победили!' : 'Congratulations, you won!';
        } else {
            statusEl.textContent = language === 'ru' ? 'Айзен: "Ты проиграл, но это было интересно."' : 'Aizen: "You lost, but it was interesting."';
        }
    }
    
    function setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', startNewGame);
        document.getElementById('undoBtn').addEventListener('click', undoLastMove);
        document.getElementById('flipBtn').addEventListener('click', flipBoard);
        document.getElementById('saveProfileBtn').addEventListener('click', updateProfile);
        
        // Переключение вкладок
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
                btn.classList.add('active');
                document.getElementById(btn.dataset.tab + 'Tab').classList.remove('hidden');
            });
        });
        
        // Переключение тем
        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentTheme = btn.dataset.theme;
                localStorage.setItem('chesszerd_theme', currentTheme);
                loadTheme();
            });
        });
        
        // Переключение стилей
        document.querySelectorAll('.style-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentStyle = btn.dataset.styleName;
                localStorage.setItem('chesszerd_style', currentStyle);
                loadStyle();
            });
        });
        
        // Переключение языков
        document.querySelectorAll('.lang-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                language = btn.dataset.lang;
                localStorage.setItem('chesszerd_lang', language);
                loadLanguage();
            });
        });
        
        // Выбор аватара
        document.querySelectorAll('.avatar-option').forEach(avatar => {
            avatar.addEventListener('click', () => {
                playerAvatar = parseInt(avatar.dataset.avatarIndex);
                document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
                avatar.classList.add('selected');
            });
        });
        
        // Google OAuth
        document.getElementById('googleLoginBtn').addEventListener('click', loginWithGoogle);
        
        // Chess.com импорт
        document.getElementById('chesscomBtn').addEventListener('click', importFromChessCom);
    }
    
    function flipBoard() {
        const board = document.getElementById('board');
        board.classList.toggle('flipped');
    }
    
    function updateProfile() {
        playerName = document.getElementById('playerName').value || 'Игрок';
        saveProfile();
        loadProfile();
        alert(language === 'ru' ? 'Профиль сохранён!' : 'Profile saved!');
    }
    
    function loginWithGoogle() {
        if (typeof google === 'undefined' || !google.accounts) {
            alert('Google OAuth не доступен в офлайн-режиме');
            return;
        }
        
        const client = google.accounts.oauth2.initTokenClient({
            client_id: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
            scope: 'email profile',
            callback: (response) => {
                if (response.access_token) {
                    fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                        headers: { Authorization: `Bearer ${response.access_token}` }
                    })
                    .then(res => res.json())
                    .then(data => {
                        playerName = data.name || playerName;
                        document.getElementById('playerName').value = playerName;
                        saveProfile();
                        loadProfile();
                    })
                    .catch(() => {
                        alert(language === 'ru' ? 'Ошибка входа' : 'Login error');
                    });
                }
            }
        });
        
        client.requestAccessToken();
    }
    
    function importFromChessCom() {
        const username = prompt(language === 'ru' ? 'Введите имя пользователя Chess.com:' : 'Enter Chess.com username:');
        if (!username) return;
        
        fetch(`https://api.chess.com/pub/player/${username}`)
            .then(response => {
                if (!response.ok) throw new Error('User not found');
                return response.json();
            })
            .then(data => {
                playerName = data.username || playerName;
                playerElo = data.rating || playerElo;
                document.getElementById('playerName').value = playerName;
                saveProfile();
                loadProfile();
                alert(language === 'ru' ? 'Профиль импортирован!' : 'Profile imported!');
            })
            .catch(() => {
                // Fallback: локальные данные
                playerName = username;
                document.getElementById('playerName').value = playerName;
                saveProfile();
                loadProfile();
                alert(language === 'ru' ? 'Не удалось подключиться к Chess.com. Использовано локальное имя.' : 'Could not connect to Chess.com. Using local name.');
            });
    }
    
    function applyTheme() {
        const root = document.documentElement;
        switch(currentTheme) {
            case 'wood':
                root.style.setProperty('--light-square', '#f0d9b5');
                root.style.setProperty('--dark-square', '#b58863');
                root.style.setProperty('--accent', '#c8a96e');
                break;
            case 'classic':
                root.style.setProperty('--light-square', '#ffce9e');
                root.style.setProperty('--dark-square', '#d18b47');
                root.style.setProperty('--accent', '#e8ab6e');
                break;
            case 'night':
                root.style.setProperty('--light-square', '#1a1a2e');
                root.style.setProperty('--dark-square', '#0f0f1a');
                root.style.setProperty('--accent', '#4a4a8e');
                break;
            case 'neon':
                root.style.setProperty('--light-square', '#1a0033');
                root.style.setProperty('--dark-square', '#0d001a');
                root.style.setProperty('--accent', '#ff00ff');
                break;
        }
        updateBoard();
    }
    
    function applyStyle() {
        const board = document.getElementById('board');
        board.classList.remove('style-neo', 'style-standard', 'style-minimal');
        board.classList.add('style-' + currentStyle);
        updateBoard();
    }
    
    function updateUILanguage() {
        const translations = {
            ru: {
                newGame: 'Новая игра',
                undo: 'Отменить',
                flip: 'Перевернуть',
                save: 'Сохранить',
                game: 'Игра',
                profile: 'Профиль',
                style: 'Стиль',
                playerName: 'Имя игрока',
                elo: 'ELO',
                wins: 'Победы',
                losses: 'Поражения',
                draws: 'Ничьи',
                loginGoogle: 'Войти через Google',
                importChesscom: 'Импорт с Chess.com'
            },
            en: {
                newGame: 'New Game',
                undo: 'Undo',
                flip: 'Flip',
                save: 'Save',
                game: 'Game',
                profile: 'Profile',
                style: 'Style',
                playerName: 'Player Name',
                elo: 'ELO',
                wins: 'Wins',
                losses: 'Losses',
                draws: 'Draws',
                loginGoogle: 'Login with Google',
                importChesscom: 'Import from Chess.com'
            }
        };
        
        const t = translations[language];
        document.getElementById('newGameBtn').textContent = t.newGame;
        document.getElementById('undoBtn').textContent = t.undo;
        document.getElementById('flipBtn').textContent = t.flip;
        document.getElementById('saveProfileBtn').textContent = t.save;
        document.querySelectorAll('.tab-btn')[0].textContent = t.game;
        document.querySelectorAll('.tab-btn')[1].textContent = t.profile;
        document.querySelectorAll('.tab-btn')[2].textContent = t.style;
        document.querySelector('label[for="playerName"]').textContent = t.playerName;
        document.getElementById('googleLoginBtn').textContent = t.loginGoogle;
        document.getElementById('chesscomBtn').textContent = t.importChesscom;
        
        updateStatus();
    }
    
    function showRandomQuote() {
        const quotes = AIZEN_QUOTES[language];
        const quote = quotes[Math.floor(Math.random() * quotes.length)];
        document.getElementById('aizenQuote').textContent = quote;
    }
    
    function showWelcomeMessage() {
        setTimeout(() => {
            const welcome = document.getElementById('welcomeScreen');
            if (welcome) {
                welcome.style.opacity = '0';
                setTimeout(() => welcome.remove(), 1000);
            }
        }, 2000);
    }
    
    function speakAIMessage() {
        if ('speechSynthesis' in window) {
            const quotes = AIZEN_QUOTES[language];
            const quote = quotes[Math.floor(Math.random() * quotes.length)];
            const utterance = new SpeechSynthesisUtterance(quote);
            utterance.lang = language === 'ru' ? 'ru-RU' : 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 0.8;
            speechSynthesis.speak(utterance);
        }
    }
    
    function playMoveSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.1;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
            oscillator.stop(audioContext.currentTime + 0.1);
        } catch(e) {
            // Fallback: игнорируем ошибку звука
        }
    }
    
    function playSelectSound() {
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            gainNode.gain.value = 0.05;
            
            oscillator.start();
            gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.05);
            oscillator.stop(audioContext.currentTime + 0.05);
        } catch(e) {
            // Fallback
        }
    }
    
    // Обработчик ошибок с виброоткликом
    window.addEventListener('error', function(e) {
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        console.error('Chesszerd Error:', e.message);
    });
    
    // Service Worker для офлайн-режима
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js').catch(function() {
                // Service Worker необязателен
            });
        });
    }
    
    // Инициализация при загрузке
    window.addEventListener('DOMContentLoaded', init);
    
    // Экспорт глобальных функций для HTML
    window.startNewGame = startNewGame;
    window.undoLastMove = undoLastMove;
    window.flipBoard = flipBoard;
    window.updateProfile = updateProfile;
})();
