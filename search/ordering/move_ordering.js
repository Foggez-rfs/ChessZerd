window.MoveOrdering = (function() {
    const PIECE_VALUES = { '♙':1, '♘':3, '♗':3, '♖':5, '♕':9, '♔':10, '♟':1, '♞':3, '♝':3, '♜':5, '♛':9, '♚':10 };
    const killerMoves = []; // будет заполняться из killer_moves.js
    const historyTable = {}; // будет заполняться

    function scoreMove(state, move, ply) {
        let score = 0;
        // Взятие: MVV-LVA
        if (move.capture) {
            const victim = state.board[move.to];
            const attacker = state.board[move.from];
            score += 1000 + (PIECE_VALUES[victim] || 0) * 10 - (PIECE_VALUES[attacker] || 0);
        }
        // Превращение
        if (move.promotion) {
            score += 800;
        }
        // Киллер-ходы
        if (killerMoves[ply] && killerMoves[ply].some(k => k.from === move.from && k.to === move.to)) {
            score += 500;
        }
        // История
        const histKey = state.board[move.from] + move.from + move.to;
        if (historyTable[histKey]) {
            score += historyTable[histKey];
        }
        return score;
    }

    function orderMoves(state, moves, ply) {
        return moves.sort((a,b) => scoreMove(state, b, ply) - scoreMove(state, a, ply));
    }

    return { orderMoves };
})();
