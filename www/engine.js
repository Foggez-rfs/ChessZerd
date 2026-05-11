// engine.js – нейросетевой поиск лучшего хода
window.searchBestMove = (function() {
    const State = window.BoardState;
    const Validator = window.MoveValidator;
    const Eval = window.PositionEvaluator || { evaluate: function(state) {
        // Запасной оценочный контур, если нейросеть не загружена
        const PIECE_VALUES = { '♔':20000,'♕':900,'♖':500,'♗':330,'♘':320,'♙':100,'♚':20000,'♛':900,'♜':500,'♝':330,'♞':320,'♟':100 };
        let score = 0;
        const board = state.board, colors = state.colors;
        for (let i=0; i<64; i++) {
            const piece = board[i];
            if (!piece) continue;
            const val = PIECE_VALUES[piece] || 0;
            score += colors[i]===1 ? -val : val;
        }
        return score;
    }};

    function minimax(state, depth, alpha, beta, maximizing) {
        if (depth === 0) return Eval.evaluate(state);
        const moves = Validator.getAllLegalMoves(state);
        if (moves.length === 0) {
            const inCheck = window.CheckDetector.isKingInCheck(state, state.activeColor);
            return inCheck ? (maximizing ? -99999 : 99999) : 0;
        }
        const ordered = (window.MoveOrdering && window.MoveOrdering.orderMoves) ?
            window.MoveOrdering.orderMoves(state, moves, 0) : moves;

        if (maximizing) {
            let best = -Infinity;
            for (let move of ordered) {
                const newState = State.simulateMove(state, move);
                best = Math.max(best, minimax(newState, depth - 1, alpha, beta, false));
                alpha = Math.max(alpha, best);
                if (alpha >= beta) break;
            }
            return best;
        } else {
            let best = Infinity;
            for (let move of ordered) {
                const newState = State.simulateMove(state, move);
                best = Math.min(best, minimax(newState, depth - 1, alpha, beta, true));
                beta = Math.min(beta, best);
                if (alpha >= beta) break;
            }
            return best;
        }
    }

    return function bestMove(state, depth) {
        const moves = Validator.getAllLegalMoves(state);
        if (moves.length === 0) return null;
        const ordered = (window.MoveOrdering && window.MoveOrdering.orderMoves) ?
            window.MoveOrdering.orderMoves(state, moves, 0) : moves;

        let best = ordered[0];
        let bestVal = state.activeColor === 0 ? -Infinity : Infinity;
        for (let move of ordered) {
            const newState = State.simulateMove(state, move);
            const val = minimax(newState, depth - 1, -Infinity, Infinity, state.activeColor !== 0);
            if (state.activeColor === 0 && val > bestVal) { bestVal = val; best = move; }
            else if (state.activeColor === 1 && val < bestVal) { bestVal = val; best = move; }
        }
        return best;
    };
})();
