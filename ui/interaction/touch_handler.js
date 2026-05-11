window.TouchHandler = (function() {
    let onSquareClicked = null;

    function init(callback) {
        onSquareClicked = callback;
        const squares = document.querySelectorAll('.square');
        squares.forEach(sq => {
            sq.addEventListener('click', (e) => {
                const index = parseInt(sq.dataset.index);
                onSquareClicked(index);
            });
            sq.addEventListener('touchstart', (e) => {
                e.preventDefault();
                const index = parseInt(sq.dataset.index);
                onSquareClicked(index);
            });
        });
    }

    return { init };
})();
