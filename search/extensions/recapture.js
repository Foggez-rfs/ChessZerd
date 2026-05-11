window.RecaptureExtension = (function() {
    // Продление при взятии той же клетки (рекапча)
    function extend(state, move, prevMove) {
        if (!prevMove || !prevMove.capture) return 0;
        if (move.to === prevMove.to) return 1;
        return 0;
    }
    return { extend };
})();
