window.FutilityPruning = (function() {
    // На малой глубине отбрасываем тихие ходы, которые не поднимают оценку выше альфа
    function isFutile(state, alpha, depth, move) {
        if (depth > 2) return false;
        if (move.capture || move.promotion) return false;
        const staticEval = window.PositionEvaluator.evaluate(state);
        const margin = 100 * depth; // запас
        return staticEval + margin <= alpha;
    }
    return { isFutile };
})();
