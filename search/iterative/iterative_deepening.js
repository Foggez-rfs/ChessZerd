window.IterativeDeepening = (function() {
    const AlphaBeta = window.AlphaBeta;
    const Aspiration = window.Aspiration || {};

    function search(state, maxDepth, timeLimit) {
        const startTime = Date.now();
        let bestMove = null;
        let bestScore = 0;
        let alpha = -Infinity, beta = Infinity;

        for (let d = 1; d <= maxDepth; d++) {
            if (timeLimit && (Date.now() - startTime) > timeLimit) break;

            if (Aspiration.search) {
                // Используем аспирационное окно
                const result = Aspiration.search(state, d, bestScore, timeLimit ? timeLimit - (Date.now() - startTime) : null);
                if (result) {
                    bestMove = result.move;
                    bestScore = result.score;
                }
                continue;
            }

            // Обычный поиск
            const moves = window.MoveValidator.getAllLegalMoves(state);
            if (moves.length === 0) return null;
            const orderedMoves = window.MoveOrdering.orderMoves(state, moves, 0);
            let currentBest = null;
            let currentScore = -Infinity;

            for (let move of orderedMoves) {
                const newState = window.BoardState.simulateMove(state, move);
                const score = -AlphaBeta.search(newState, d-1, -beta, -alpha, 1);
                if (score > currentScore) {
                    currentScore = score;
                    currentBest = move;
                }
                alpha = Math.max(alpha, score);
            }
            bestMove = currentBest;
            bestScore = currentScore;
        }
        return bestMove;
    }

    return { search };
})();
