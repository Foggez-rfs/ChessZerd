window.CheckDetector = (function() {
    function isSquareAttacked(board, colors, sq, attackerColor) {
        const r=Math.floor(sq/8), c=sq%8;
        // Пешки
        if (attackerColor===0) {
            if (sq+9<64 && c<7 && board[sq+9]==='♙') return true;
            if (sq+7<64 && c>0 && board[sq+7]==='♙') return true;
        } else {
            if (sq-9>=0 && c>0 && board[sq-9]==='♟') return true;
            if (sq-7>=0 && c<7 && board[sq-7]==='♟') return true;
        }
        // Конь
        const knight = attackerColor===0?'♘':'♞';
        const knightOffsets = [-17,-15,-10,-6,6,10,15,17];
        for (let o of knightOffsets) {
            const to=sq+o; if (to>=0&&to<64 && Math.abs(Math.floor(to/8)-r)<=2 && board[to]===knight) return true;
        }
        // Скользящие
        const slides = { b:[-9,-7,7,9], r:[-8,8,-1,1], q:[-9,-7,7,9,-8,8,-1,1] };
        for (let piece in slides) {
            const unicode = attackerColor===0? piece.toUpperCase() : piece.toLowerCase();
            for (let d of slides[piece]) {
                for (let i=1; i<8; i++) {
                    const to = sq+d*i;
                    if (to<0||to>=64) break;
                    const tr=Math.floor(to/8), tc=to%8;
                    if ([-1,1].includes(d) && tr!==r) break;
                    if ([-9,-7,7,9].includes(d) && (Math.abs(tr-r)!==i||Math.abs(tc-c)!==i)) break;
                    if (board[to]==='') continue;
                    if (board[to]===unicode) return true;
                    break;
                }
            }
        }
        // Король
        const king = attackerColor===0?'♔':'♚';
        const kingOffsets = [-9,-8,-7,-1,1,7,8,9];
        for (let o of kingOffsets) {
            const to=sq+o; if (to>=0&&to<64 && Math.abs(Math.floor(to/8)-r)<=1 && board[to]===king) return true;
        }
        return false;
    }
    function isKingInCheck(state, color) {
        const king = color===0?'♔':'♚';
        const idx = state.board.indexOf(king);
        if (idx===-1) return true;
        return isSquareAttacked(state.board, state.colors, idx, 1-color);
    }
    return { isSquareAttacked, isKingInCheck };
})();
