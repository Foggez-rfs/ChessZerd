window.Aspiration = (function() {
    const AlphaBeta = window.AlphaBeta;

    function search(state, depth, prevScore, timeLimit) {
        let alpha = prevScore - 50;
        let beta = prevScore + 50;
        const moves = window.MoveValidator.getAllLegalMoves(state);
        if (moves.length === 0) return null;
        const orderedMoves = window.MoveOrdering.orderMoves(state, moves, 0);

        let bestMove = null;
        let bestScore = -Infinity;
        let research = true;

        while (research) {
            research = false;
            alpha = Math.max(alpha, -Infinity);
            beta = Math.min(beta, Infinity);
            bestScore = -Infinity;

            for (let move of orderedMoves) {
                const newState = window.BoardState.simulateMove(state, move);
                const score = -AlphaBeta.search(newState, depth-1, -beta, -alpha, 1);
                if (score > bestScore) {
                    bestScore = score;
                    bestMove = move;
                }
                alpha = Math.max(alpha, score);
            }

            if (bestScore <= alpha - 50) {
                alpha -= 100; // расширяем окно вниз
                research = true;
            } else if (bestScore >= beta + 50) {
                beta += 100; // расширяем окно вверх
                research = true;
            }
        }
        return { move: bestMove, score: bestScore };
    }
    return { search };
})();
