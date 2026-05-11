window.PawnMoves = (function() {
    function generate(board, colors, idx, color, enPassant) {
        const moves = [];
        const r = Math.floor(idx/8), c = idx%8;
        const dir = (color===0) ? -1 : 1;
        const oneStep = idx + dir*8;
        if (oneStep>=0 && oneStep<64 && board[oneStep]==='') {
            moves.push({from:idx, to:oneStep});
            if ((color===0 && r===6) || (color===1 && r===1)) {
                const twoStep = idx + dir*16;
                if (board[twoStep]==='') moves.push({from:idx, to:twoStep});
            }
        }
        [-1,1].forEach(dc => {
            const to = idx + dir*8 + dc;
            if (to>=0 && to<64 && Math.abs((to%8)-c)===1) {
                if (colors[to] !== -1 && colors[to] !== color) moves.push({from:idx, to:to, capture:true});
                else if (to === enPassant) moves.push({from:idx, to:to, enPassant:true});
            }
        });
        return moves;
    }
    return { generate };
})();
