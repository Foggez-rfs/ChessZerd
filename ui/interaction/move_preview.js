window.MovePreview = (function() {
    function showLegalMoves(moves) {
        window.BoardRenderer.clearHighlights();
        moves.forEach(m => {
            const sq = window.BoardRenderer.getSquareElement(m.to);
            if (sq) {
                sq.classList.add(m.capture ? 'capture-move' : 'valid-move');
            }
        });
    }

    function showSelected(index) {
        window.BoardRenderer.getSquareElement(index)?.classList.add('selected');
    }

    return { showLegalMoves, showSelected };
})();
