window.PawnPushExtension = (function() {
    // Продление, когда пешка доходит до 7-й горизонтали
    function extend(move) {
        const piece = window.BoardState.getBoard()[move.from];
        if ((piece === '♙' && Math.floor(move.to/8) === 1) ||
            (piece === '♟' && Math.floor(move.to/8) === 6)) {
            return 1;
        }
        return 0;
    }
    return { extend };
})();
