window.SEE = (function() {
    const PIECE_VALUES = {
        '♙': 1, '♘': 3, '♗': 3, '♖': 5, '♕': 9, '♔': 99,
        '♟': 1, '♞': 3, '♝': 3, '♜': 5, '♛': 9, '♚': 99
    };

    // Static Exchange Evaluation: оценка взятия
    function see(state, move) {
        // упрощённо: просто разница материала
        const attacker = PIECE_VALUES[state.board[move.from]] || 0;
        const victim = PIECE_VALUES[state.board[move.to]] || 0;
        return victim - attacker;
    }

    return { see, PIECE_VALUES };
})();
