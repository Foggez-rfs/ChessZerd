// app.js – новый UI, использующий модули
(function() {
    'use strict';

    const B = window.BitboardCore;
    const State = window.BoardState;
    const Game = window.GameState;
    const Validator = window.MoveValidator;
    const Eval = window.PositionEvaluator;
    const Board = window.BoardRenderer;
    const Theme = window.ThemeManager;
    const Pieces = window.PieceRenderer;
    const TabBar = window.TabBar;
    const Welcome = window.WelcomeScreen;
    const Voice = window.AizenVoice;
    const Personality = window.AizenPersonality;
    const Profile = window.PlayerProfile;
    const Stats = window.PlayerStats;
    const Lang = window.TranslationManager;
    const Events = window.EventBus;
    const GameEvents = window.GameEvents;
    const UIEvents = window.UIEvents;

    let selectedPiece = -1;
    let validMoves = [];
    let playerColor = 0;
    let gameActive = false;

    function init() {
        Board.init();
        Theme.apply(Theme.getCurrent());
        Pieces.applyStyle(Pieces.getCurrent());
        TabBar.init();
        TouchHandler.init(onSquareClick);
        setupEventListeners();

        // Загружаем профиль
        Profile.load();
        updateProfileUI();

        // Приветственный экран
        Welcome.show('portrait.jpg', 'Сосуке Айзен ждёт вас', 2000);

        // Старт новой игры
        startNewGame();
    }

    function updateProfileUI() {
        const p = Profile.get();
        document.getElementById('playerName').value = p.name;
        document.getElementById('playerElo').textContent = p.elo;
        document.getElementById('playerWins').textContent = p.wins;
        document.getElementById('playerLosses').textContent = p.losses;
        document.getElementById('playerDraws').textContent = p.draws;
    }

    function setupEventListeners() {
        document.getElementById('newGameBtn').addEventListener('click', startNewGame);
        document.getElementById('undoBtn').addEventListener('click', undoLastMove);
        document.getElementById('flipBtn').addEventListener('click', () => {
            document.getElementById('board').classList.toggle('flipped');
            Events.emit(UIEvents.BOARD_FLIP);
        });
        document.getElementById('saveProfileBtn').addEventListener('click', () => {
            const name = document.getElementById('playerName').value.trim() || 'Игрок';
            Profile.update({ name });
            Profile.save();
            updateProfileUI();
            Events.emit(UIEvents.PROFILE_SAVE);
        });
        document.querySelectorAll('.theme-btn').forEach(b => b.addEventListener('click', () => Theme.apply(b.dataset.theme)));
        document.querySelectorAll('.style-btn').forEach(b => b.addEventListener('click', () => Pieces.applyStyle(b.dataset.styleName)));
        document.querySelectorAll('.lang-btn').forEach(b => b.addEventListener('click', () => {
            Lang.setLanguage(b.dataset.lang);
            updateLanguage();
        }));
        document.getElementById('googleLoginBtn').addEventListener('click', () => alert('Google OAuth - укажите client_id'));
        document.getElementById('chesscomBtn').addEventListener('click', () => alert('Импорт с Chess.com'));
        document.querySelectorAll('.avatar-option').forEach(el => el.addEventListener('click', function() {
            document.querySelectorAll('.avatar-option').forEach(a => a.classList.remove('selected'));
            this.classList.add('selected');
            Profile.update({ avatar: parseInt(this.dataset.avatarIndex) });
        }));
    }

    function updateLanguage() {
        const t = (key) => Lang.get(key);
        document.getElementById('newGameBtn').textContent = t('newGame');
        document.getElementById('undoBtn').textContent = t('undo');
        document.getElementById('flipBtn').textContent = t('flip');
        document.getElementById('saveProfileBtn').textContent = t('save');
        document.querySelectorAll('.tab-btn')[0].textContent = t('game');
        document.querySelectorAll('.tab-btn')[1].textContent = t('profile');
        document.querySelectorAll('.tab-btn')[2].textContent = t('style');
        document.getElementById('googleLoginBtn').textContent = t('loginGoogle');
        document.getElementById('chesscomBtn').textContent = t('importChesscom');
        updateStatus();
    }

    function onSquareClick(index) {
        if (!gameActive || Game.isGameOver()) return;
        const board = State.getBoard();
        const color = State.getColorAt(index);
        const piece = board[index];

        if (selectedPiece === -1) {
            if (piece && color === playerColor) {
                selectedPiece = index;
                validMoves = Validator.getLegalMoves(State.getState(), index);
                Board.clearHighlights();
                MovePreview.showLegalMoves(validMoves);
                MovePreview.showSelected(selectedPiece);
                ClickEffects.playClick();
            }
        } else if (index === selectedPiece) {
            selectedPiece = -1;
            validMoves = [];
            Board.clearHighlights();
        } else if (validMoves.some(m => m.to === index)) {
            const move = validMoves.find(m => m.to === index);
            executePlayerMove(move);
        } else if (piece && color === playerColor) {
            selectedPiece = index;
            validMoves = Validator.getLegalMoves(State.getState(), index);
            Board.clearHighlights();
            MovePreview.showLegalMoves(validMoves);
            MovePreview.showSelected(selectedPiece);
            ClickEffects.playClick();
        }
    }

    function executePlayerMove(move) {
        const board = State.getBoard();
        const piece = board[move.from];
        if ((piece === '♙' && Math.floor(move.to / 8) === 0) || (piece === '♟' && Math.floor(move.to / 8) === 7)) {
            const choice = prompt(Lang.get('choosePromotion') || 'Выберите фигуру (♕♖♗♘):', '♕');
            if (!choice || !'♕♖♗♘♛♜♝♞'.includes(choice)) return;
            move.promotion = choice;
        }
        State.makeMove(move);
        if (move.promotion) State.getBoard()[move.to] = move.promotion;
        selectedPiece = -1;
        validMoves = [];
        Board.clearHighlights();
        Board.render(State.getState());
        Events.emit(GameEvents.MOVE_MADE, move);

        Game.updateResult(State);
        if (Game.isGameOver()) {
            handleGameEnd();
            return;
        }
        setTimeout(makeAIMove, 400);
    }

    function makeAIMove() {
        if (State.getActiveColor() !== 1 - playerColor) return;
        const depth = Math.min(4, Math.floor(Stats.getStats().elo / 500) + 1);
        const best = window.searchBestMove(State.getState(), depth);
        if (!best) { handleGameEnd(); return; }
        const board = State.getBoard();
        const piece = board[best.from];
        if ((piece === '♙' && Math.floor(best.to / 8) === 0) || (piece === '♟' && Math.floor(best.to / 8) === 7)) {
            best.promotion = playerColor === 0 ? '♛' : '♕';
        }
        State.makeMove(best);
        if (best.promotion) State.getBoard()[best.to] = best.promotion;
        Board.render(State.getState());
        Events.emit(GameEvents.AI_MOVE, best);
        Voice.speak(Personality.getQuote(Lang.getLanguage()));
        Game.updateResult(State);
        if (Game.isGameOver()) handleGameEnd();
        else updateStatus();
    }

    function handleGameEnd() {
        gameActive = false;
        const result = Game.getResult();
        let record = result;
        if (result === '1-0') record = playerColor === 0 ? 'win' : 'loss';
        else if (result === '0-1') record = playerColor === 1 ? 'win' : 'loss';
        else record = 'draw';
        Profile.addGameResult(record);
        const opponentElo = Math.round(playerColor === 0 ? 1200 + Math.random() * 400 : 1200 - Math.random() * 400);
        const newElo = window.ELORating.updateRating(Profile.get().elo, opponentElo, record === 'win' ? 1 : record === 'loss' ? 0 : 0.5);
        Profile.update({ elo: newElo });
        Profile.save();
        updateProfileUI();
        updateStatus();
        document.getElementById('aizenQuote').textContent = Personality.getQuote(Lang.getLanguage());
    }

    function startNewGame() {
        State.reset();
        Game.reset();
        selectedPiece = -1;
        validMoves = [];
        gameActive = true;
        Board.clearHighlights();
        Board.render(State.getState());
        document.getElementById('aizenQuote').textContent = Personality.getQuote(Lang.getLanguage());
        if (playerColor === 1) {
            updateStatus();
            setTimeout(makeAIMove, 800);
        } else {
            updateStatus();
        }
        Events.emit(GameEvents.NEW_GAME);
    }

    function undoLastMove() {
        if (State.getHistoryLength() < 2) return;
        State.undoMove();
        State.undoMove();
        selectedPiece = -1;
        validMoves = [];
        Board.clearHighlights();
        Board.render(State.getState());
        Game.updateResult(State);
        updateStatus();
        Events.emit(GameEvents.UNDO_MOVE);
    }

    function updateStatus() {
        const st = document.getElementById('status');
        if (Game.isGameOver()) {
            const res = Game.getResult();
            if (res === '1/2-1/2') st.textContent = Lang.get('draw');
            else if ((res === '1-0' && playerColor === 0) || (res === '0-1' && playerColor === 1)) st.textContent = Lang.get('youWin');
            else st.textContent = Lang.get('aiWin');
        } else {
            st.textContent = State.getActiveColor() === playerColor ? Lang.get('yourMove') : Lang.get('aiMove');
        }
    }

    window.addEventListener('DOMContentLoaded', init);
})();
