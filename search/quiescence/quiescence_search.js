window.QuiescenceSearch = (function() {
    const Eval = window.PositionEvaluator;
    const SEE = window.SEE;

    function search(state, alpha, beta, ply) {
        if (ply === undefined) ply = 0;
        const standPat = Eval.evaluate(state);
        if (standPat >= beta) return beta;
        if (standPat > alpha) alpha = standPat;

        // Генерируем только взятия
        const moves = window.MoveValidator.getAllLegalMoves(state).filter(m => m.capture || m.promotion);
        if (moves.length === 0) return standPat;

        // Сортировка по MVV-LVA
        const orderedMoves = window.MoveOrdering.orderMoves(state, moves, ply);

        for (let move of orderedMoves) {
            // Delta pruning
            const victim = state.board[move.to];
            const value = victim ? (SEE.PIECE_VALUES[victim] || 1) * 100 : 0;
            if (standPat + value + 200 <= alpha) continue;

            const newState = window.BoardState.simulateMove(state, move);
            const score = -search(newState, -beta, -alpha, ply+1);
            if (score >= beta) return beta;
            if (score > alpha) alpha = score;
        }
        return alpha;
    }

    return { search };
})();
