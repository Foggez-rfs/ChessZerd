window.PieceRenderer = (function() {
    function applyStyle(styleName) {
        const board = document.getElementById('board');
        board.classList.remove('style-neo', 'style-standard', 'style-minimal');
        board.classList.add('style-' + styleName);
    }
    return { applyStyle };
})();
