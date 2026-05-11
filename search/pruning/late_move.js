window.LateMoveReduction = (function() {
    // Определяем, насколько сократить глубину для хода (поздние ходы)
    function reduction(depth, moveIndex) {
        if (depth < 3 || moveIndex < 4) return 0;
        return 1 + Math.floor((moveIndex - 4) / 6);
    }
    return { reduction };
})();
