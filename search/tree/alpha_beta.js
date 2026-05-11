window.AlphaBeta = (function() {
    const Validator = window.MoveValidator;
    const State = window.BoardState;
    const Quiesce = window.QuiescenceSearch || { search: (s) => window.PositionEvaluator.evaluate(s) };
    const Eval = window.PositionEvaluator;
    const Ext = window.Extensions || {};

    // Главная альфа-бета с квисенсом
    function search(state, depth, alpha, beta, ply) {
        if (ply === undefined) ply = 0;

        // Проверка на досрочный выход: ничья или мат
        const moves = Validator.getAllLegalMoves(state);
        if (moves.length === 0) {
            const inCheck = window.CheckDetector.isKingInCheck(state, state.activeColor);
            if (inCheck) return -(99999 - ply); // мат
            return 0; // пат
        }

        // Квисенс на глубине 0
        if (depth <= 0) {
            return Quiesce.search(state, alpha, beta, ply);
        }

        // Расширения (шах и т.д.) – увеличиваем глубину
        const inCheck = window.CheckDetector.isKingInCheck(state, state.activeColor);
        if (inCheck && Ext.checkExtension) {
            depth += Ext.checkExtension(state, ply);
        }

        // Сортировка ходов
        const orderedMoves = window.MoveOrdering.orderMoves(state, moves, ply);

        let bestVal = -Infinity;
        for (let i = 0; i < orderedMoves.length; i++) {
            const move = orderedMoves[i];
            const newState = State.simulateMove(state, move);

            // Позднее сокращение (LMR) и т.д. – будет в pruning, здесь упрощённо
            let val;
            if (i >= 3 && depth >= 3 && !move.capture && !move.promotion) {
                val = -search(newState, depth - 2, -(alpha+1), -alpha, ply+1);
                if (val > alpha && val < beta) {
                    val = -search(newState, depth - 1, -beta, -val, ply+1);
                }
            } else {
                val = -search(newState, depth - 1, -beta, -alpha, ply+1);
            }

            if (val > bestVal) bestVal = val;
            if (val > alpha) alpha = val;
            if (alpha >= beta) break;
        }
        return bestVal;
    }

    return { search };
})();
