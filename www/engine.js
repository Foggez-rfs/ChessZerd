window.searchBestMove = (function() {
    const Validator = window.MoveValidator;
    const State = window.BoardState;
    const Evaluator = window.PositionEvaluator;

    function evaluate(state) {
        return Evaluator.evaluate(state);
    }

    function minimax(state, depth, alpha, beta, maximizing) {
        if (depth === 0) return evaluate(state);
        const moves = Validator.getAllLegalMoves(state);
        if (moves.length === 0) {
            const inCheck = window.CheckDetector.isKingInCheck(state, state.activeColor);
            return inCheck ? (maximizing ? -99999 : 99999) : 0;
        }
        if (maximizing) {
            let maxEval = -Infinity;
            for (let move of moves) {
                const newState = State.simulateMove(state, move);
                const val = minimax(newState, depth-1, alpha, beta, false);
                maxEval = Math.max(maxEval, val);
                alpha = Math.max(alpha, val);
                if (beta <= alpha) break;
            }
            return maxEval;
        } else {
            let minEval = Infinity;
            for (let move of moves) {
                const newState = State.simulateMove(state, move);
                const val = minimax(newState, depth-1, alpha, beta, true);
                minEval = Math.min(minEval, val);
                beta = Math.min(beta, val);
                if (beta <= alpha) break;
            }
            return minEval;
        }
    }

    return function bestMove(state, depth) {
        const moves = Validator.getAllLegalMoves(state);
        if (moves.length === 0) return null;
        let best = moves[0];
        let bestVal = state.activeColor === 0 ? -Infinity : Infinity;
        for (let move of moves) {
            const newState = State.simulateMove(state, move);
            const val = minimax(newState, depth-1, -Infinity, Infinity, state.activeColor !== 0);
            if (state.activeColor === 0 && val > bestVal) { bestVal = val; best = move; }
            else if (state.activeColor === 1 && val < bestVal) { bestVal = val; best = move; }
        }
        return best;
    };
})();
