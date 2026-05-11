// engine.js – точка запуска поиска (нейросетевой)
window.searchBestMove = (function() {
    const State = window.BoardState;
    const MoveValidator = window.MoveValidator;
    const Evaluator = window.PositionEvaluator;

    function evaluate(state) {
        return Evaluator.evaluate(state);
    }

    function minimax(state, depth, alpha, beta, maximizing) {
        if (depth == 0) return evaluate(state);
        const moves = MoveValidator.getAllLegalMoves(state);
        if (moves.length === 0) {
            const inCheck = window.CheckDetector.isKingInCheck(state, state.activeColor);
            return inCheck ? (maximizing ? -99999 : 99999) : 0;
        }
        const ordered = window.MoveOrdering.orderMoves(state, moves, 0);
        if (maximizing) {
            let best = -Infinity;
            for (let move of ordered) {
                const s = State.simulateMove(state, move);
                best = Math.max(best, minimax(s, depth - 1, alpha, beta, false));
                alpha = Math.max(alpha, best);
                if (alpha >= beta) break;
            }
            return best;
        } else {
            let best = Infinity;
            for (let move of ordered) {
                const s = State.simulateMove(state, move);
                best = Math.min(best, minimax(s, depth - 1, alpha, beta, true));
                beta = Math.min(beta, best);
                if (alpha >= beta) break;
            }
            return best;
        }
    }

    return function bestMove(state, depth) {
        const moves = MoveValidator.getAllLegalMoves(state);
        if (moves.length === 0) return null;
        let best = moves[0];
        let bestVal = state.activeColor === 0 ? -Infinity : Infinity;
        const ordered = window.MoveOrdering.orderMoves(state, moves, 0);
        for (let move of ordered) {
            const s = State.simulateMove(state, move);
            const val = minimax(s, depth - 1, -Infinity, Infinity, state.activeColor !== 0);
            if (state.activeColor === 0 && val > bestVal) { bestVal = val; best = move; }
            else if (state.activeColor === 1 && val < bestVal) { bestVal = val; best = move; }
        }
        return best;
    };
})();
