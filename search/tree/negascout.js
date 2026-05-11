window.NegaScout = (function() {
    const AlphaBeta = window.AlphaBeta;
    function search(state, depth) {
        const Validator = window.MoveValidator;
        const State = window.BoardState;
        const moves = Validator.getAllLegalMoves(state);
        if (moves.length === 0) {
            if (window.CheckDetector.isKingInCheck(state, state.activeColor)) return -(99999);
            return 0;
        }
        let bestVal = -Infinity;
        // Первый ход с полным окном
        let firstMove = true;
        const orderedMoves = window.MoveOrdering.orderMoves(state, moves, 0);
        for (let move of orderedMoves) {
            const newState = State.simulateMove(state, move);
            let val;
            if (firstMove) {
                val = -AlphaBeta.search(newState, depth-1, -Infinity, -bestVal, 1);
                firstMove = false;
            } else {
                val = -AlphaBeta.search(newState, depth-1, -(bestVal+1), -bestVal, 1);
                if (val > bestVal) {
                    val = -AlphaBeta.search(newState, depth-1, -Infinity, -bestVal, 1);
                }
            }
            if (val > bestVal) bestVal = val;
        }
        return bestVal;
    }
    return { search };
})();
