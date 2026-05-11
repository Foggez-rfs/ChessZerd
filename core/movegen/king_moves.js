window.KingMoves = (function() {
    const offsets = [-9,-8,-7,-1,1,7,8,9];
    function generate(board, colors, idx, color, castlingRights) {
        const moves = [];
        const r=Math.floor(idx/8), c=idx%8;
        for (let o of offsets) {
            const to = idx+o;
            if (to>=0 && to<64 && Math.abs(Math.floor(to/8)-r)<=1 && Math.abs(to%8-c)<=1) {
                if (colors[to] !== color) moves.push({from:idx, to:to, capture: colors[to]!==-1});
            }
        }
        // Рокировка
        const rank = color===0?7:0;
        if (!window.CheckDetector.isKingInCheck({board,colors,activeColor:color}, color)) {
            if (castlingRights.includes(color===0?'K':'k')) {
                if (board[rank+5]==='' && board[rank+6]==='') {
                    // проверка полей под атакой
                    moves.push({from:idx, to:idx+2, castle:'kingside'});
                }
            }
            if (castlingRights.includes(color===0?'Q':'q')) {
                if (board[rank+3]==='' && board[rank+2]==='' && board[rank+1]==='') {
                    moves.push({from:idx, to:idx-2, castle:'queenside'});
                }
            }
        }
        return moves;
    }
    return { generate };
})();
