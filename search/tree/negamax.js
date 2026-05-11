window.NegaMax = (function() {
    const AlphaBeta = window.AlphaBeta;
    function search(state, depth) {
        return AlphaBeta.search(state, depth, -Infinity, Infinity, 0);
    }
    return { search };
})();
