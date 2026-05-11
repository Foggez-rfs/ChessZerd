window.SlidingMoves = (function() {
    const dirs = { b: [-9,-7,7,9], r: [-8,8,-1,1], q: [-9,-7,7,9,-8,8,-1,1] };
    function generate(board, colors, idx, color, pieceType) {
        const moves = [];
        const r=Math.floor(idx/8), c=idx%8;
        const dlist = dirs[pieceType] || [];
        for (let d of dlist) {
            for (let i=1; i<8; i++) {
                const to = idx + d*i;
                if (to<0||to>=64) break;
                const tr=Math.floor(to/8), tc=to%8;
                if ([-1,1].includes(d) && tr!==r) break;
                if ([-9,-7,7,9].includes(d) && (Math.abs(tr-r)!==i || Math.abs(tc-c)!==i)) break;
                if (board[to]==='') moves.push({from:idx, to:to});
                else {
                    if (colors[to] !== color) moves.push({from:idx, to:to, capture:true});
                    break;
                }
            }
        }
        return moves;
    }
    return { generate };
})();
