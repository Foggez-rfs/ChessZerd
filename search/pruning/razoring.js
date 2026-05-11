window.Razoring = (function() {
    // На предпоследней глубине, если стат.оценка сильно ниже альфа, сразу возвращаем квисенс
    function tryRazor(state, depth, alpha, beta) {
        if (depth !== 1) return null;
        const staticEval = window.PositionEvaluator.evaluate(state);
        if (staticEval + 500 <= alpha) {
            // возвращаем квисенс, но не меньше стат.оценки
            return Math.max(staticEval, window.QuiescenceSearch.search(state, alpha, beta, 0));
        }
        return null;
    }
    return { tryRazor };
})();
