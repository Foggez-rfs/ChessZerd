window.BoardEncoder = (function() {
    const PIECE_MAP = {
        '♙': 0, '♘': 1, '♗': 2, '♖': 3, '♕': 4, '♔': 5,
        '♟': 6, '♞': 7, '♝': 8, '♜': 9, '♛': 10, '♚': 11
    };
    function encode(state) {
        const input = new Array(768).fill(0);
        const board = state.board;
        for (let i = 0; i < 64; i++) {
            const piece = board[i];
            if (piece) {
                const plane = PIECE_MAP[piece];
                input[plane * 64 + i] = 1;
            }
        }
        input[768 - 64] = state.activeColor === 0 ? 1 : -1;
        return input;
    }
    return { encode };
})();
