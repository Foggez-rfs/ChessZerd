window.KnightMoves = (function() {
    const offsets = [-17,-15,-10,-6,6,10,15,17];
    function generate(board, colors, idx, color) {
        const moves = [];
        const r=Math.floor(idx/8), c=idx%8;
        for (let o of offsets) {
            const to = idx+o;
            if (to>=0 && to<64 && Math.abs(Math.floor(to/8)-r)<=2 && Math.abs(to%8-c)<=2) {
                if (colors[to] !== color) moves.push({from:idx, to:to, capture: colors[to]!==-1});
            }
        }
        return moves;
    }
    return { generate };
})();
