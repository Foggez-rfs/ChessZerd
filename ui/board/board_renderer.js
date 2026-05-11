window.BoardRenderer = (function() {
    const boardEl = document.getElementById('board');
    let squares = [];

    function init() {
        boardEl.innerHTML = '';
        squares = [];
        for (let i = 0; i < 64; i++) {
            const sq = document.createElement('div');
            sq.className = 'square';
            sq.dataset.index = i;
            const row = Math.floor(i / 8), col = i % 8;
            sq.classList.add((row + col) % 2 === 0 ? 'light' : 'dark');
            boardEl.appendChild(sq);
            squares.push(sq);
        }
    }

    function render(state) {
        const board = state.board;
        squares.forEach((sq, i) => {
            sq.textContent = board[i] || '';
        });
    }

    function highlightSquare(index, className) {
        squares[index]?.classList.add(className);
    }

    function clearHighlights() {
        squares.forEach(sq => sq.classList.remove('selected', 'valid-move', 'capture-move'));
    }

    function getSquareElement(index) { return squares[index]; }

    return { init, render, highlightSquare, clearHighlights, getSquareElement };
})();
