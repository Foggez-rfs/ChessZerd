window.MoveValidator = (function() {
    const Check = window.CheckDetector;
    const State = window.BoardState;

    function getLegalMoves(state, idx) {
        const board = state.board, colors = state.colors, piece = board[idx];
        if (!piece || colors[idx] !== state.activeColor) return [];
        let moves = [];
        switch(piece) {
            case '♙': case '♟': moves = window.PawnMoves.generate(board, colors, idx, colors[idx], state.enPassant); break;
            case '♘': case '♞': moves = window.KnightMoves.generate(board, colors, idx, colors[idx]); break;
            case '♗': case '♝': moves = window.SlidingMoves.generate(board, colors, idx, colors[idx], 'b'); break;
            case '♖': case '♜': moves = window.SlidingMoves.generate(board, colors, idx, colors[idx], 'r'); break;
            case '♕': case '♛': moves = window.SlidingMoves.generate(board, colors, idx, colors[idx], 'q'); break;
            case '♔': case '♚': moves = window.KingMoves.generate(board, colors, idx, colors[idx], state.castling); break;
        }
        return moves.filter(m => {
            const newState = State.simulateMove(state, m);
            return !Check.isKingInCheck(newState, state.activeColor);
        });
    }

    function getAllLegalMoves(state) {
        const moves = [];
        for (let i=0; i<64; i++) {
            if (state.colors[i] === state.activeColor) {
                moves.push(...getLegalMoves(state, i));
            }
        }
        return moves;
    }

    return { getLegalMoves, getAllLegalMoves };
})();
