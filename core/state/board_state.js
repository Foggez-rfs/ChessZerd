// core/state/board_state.js
window.BoardState = (function() {
    const B = window.BitboardCore;
    let state = B.parseFEN(B.START_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
    let history = [];

    function reset(fen) {
        state = B.parseFEN(fen || B.START_FEN);
        history = [];
    }
    function getState() { return { ...state, board: [...state.board], colors: [...state.colors] }; }
    function getBoard() { return state.board; }
    function getColors() { return state.colors; }
    function getActiveColor() { return state.activeColor; }
    function getColorAt(idx) { return state.colors[idx]; }
    function getHistoryLength() { return history.length; }

    function makeMove(move) {
        history.push({
            board: [...state.board], colors: [...state.colors],
            activeColor: state.activeColor, castling: state.castling,
            enPassant: state.enPassant, fiftyMove: state.fiftyMove, fullMove: state.fullMove
        });
        // Применяем ход
        const piece = state.board[move.from];
        state.board[move.to] = piece;
        state.board[move.from] = '';
        state.colors[move.to] = state.colors[move.from];
        state.colors[move.from] = -1;
        // Рокировка
        if (move.castle === 'kingside') {
            const rank = Math.floor(move.from/8)*8;
            state.board[move.from+1] = state.board[rank+7]; state.board[rank+7] = '';
            state.colors[move.from+1] = state.colors[rank+7]; state.colors[rank+7] = -1;
        } else if (move.castle === 'queenside') {
            const rank = Math.floor(move.from/8)*8;
            state.board[move.from-1] = state.board[rank]; state.board[rank] = '';
            state.colors[move.from-1] = state.colors[rank]; state.colors[rank] = -1;
        }
        // Взятие на проходе
        if (move.enPassant) {
            const captured = move.to + (state.activeColor===0 ? 8 : -8);
            state.board[captured] = ''; state.colors[captured] = -1;
        }
        // Обновление флагов
        if (piece==='♙'||piece==='♟' || move.capture) state.fiftyMove = 0;
        else state.fiftyMove++;
        state.enPassant = -1;
        if ((piece==='♙'||piece==='♟') && Math.abs(move.to-move.from)===16)
            state.enPassant = (move.from + move.to)>>1;
        state.activeColor = 1 - state.activeColor;
        if (state.activeColor===0) state.fullMove++;
        // Обновление прав рокировки (упрощённо)
        if (piece==='♔') state.castling = state.castling.replace(/[KQ]/g,'');
        if (piece==='♚') state.castling = state.castling.replace(/[kq]/g,'');
        if (piece==='♖') {
            if (move.from===56) state.castling = state.castling.replace(/Q/,'');
            if (move.from===63) state.castling = state.castling.replace(/K/,'');
        }
        if (piece==='♜') {
            if (move.from===0) state.castling = state.castling.replace(/q/,'');
            if (move.from===7) state.castling = state.castling.replace(/k/,'');
        }
        return true;
    }

    function undoMove() {
        if (history.length===0) return false;
        const prev = history.pop();
        state.board = prev.board; state.colors = prev.colors;
        state.activeColor = prev.activeColor; state.castling = prev.castling;
        state.enPassant = prev.enPassant; state.fiftyMove = prev.fiftyMove; state.fullMove = prev.fullMove;
        return true;
    }

    function simulateMove(stateObj, move) {
        const s = { ...stateObj, board: [...stateObj.board], colors: [...stateObj.colors] };
        const piece = s.board[move.from];
        s.board[move.to] = piece; s.board[move.from] = '';
        s.colors[move.to] = s.colors[move.from]; s.colors[move.from] = -1;
        if (move.castle === 'kingside') {
            const rank = Math.floor(move.from/8)*8;
            s.board[move.from+1] = s.board[rank+7]; s.board[rank+7] = '';
            s.colors[move.from+1] = s.colors[rank+7]; s.colors[rank+7] = -1;
        } else if (move.castle === 'queenside') {
            const rank = Math.floor(move.from/8)*8;
            s.board[move.from-1] = s.board[rank]; s.board[rank] = '';
            s.colors[move.from-1] = s.colors[rank]; s.colors[rank] = -1;
        }
        if (move.enPassant) {
            const captured = move.to + (s.activeColor===0 ? 8 : -8);
            s.board[captured] = ''; s.colors[captured] = -1;
        }
        s.activeColor = 1 - s.activeColor;
        return s;
    }

    return { reset, getState, getBoard, getColors, getActiveColor, getColorAt, getHistoryLength, makeMove, undoMove, simulateMove };
})();
