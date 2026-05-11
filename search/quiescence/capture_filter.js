window.CaptureFilter = (function() {
    function filter(moves, state) {
        // Отбираем только "хорошие" взятия (SEE >= 0)
        return moves.filter(m => {
            if (!m.capture) return false;
            return window.SEE.see(state, m) >= 0;
        });
    }
    return { filter };
})();
