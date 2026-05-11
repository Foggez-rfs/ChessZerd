window.MTDF = (function() {
    const AlphaBeta = window.AlphaBeta;
    function search(state, depth, firstGuess) {
        let g = firstGuess || 0;
        let lower = -Infinity;
        let upper = Infinity;
        do {
            let beta = (g === lower) ? g + 1 : g;
            g = AlphaBeta.search(state, depth, beta-1, beta, 0);
            if (g < beta) upper = g;
            else lower = g;
        } while (lower < upper);
        return g;
    }
    return { search };
})();
