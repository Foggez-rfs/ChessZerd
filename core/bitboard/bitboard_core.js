// core/bitboard/bitboard_core.js
window.BitboardCore = (function() {
    const PIECE_UNICODE = { 'K':'♔','Q':'♕','R':'♖','B':'♗','N':'♘','P':'♙', 'k':'♚','q':'♛','r':'♜','b':'♝','n':'♞','p':'♟' };
    function parseFEN(fen) {
        const board = new Array(64).fill('');
        const colors = new Array(64).fill(-1);
        const parts = fen.split(' ');
        const rows = parts[0].split('/');
        for (let r=0; r<8; r++) {
            let col=0;
            for (let ch of rows[r]) {
                if (ch>='1' && ch<='8') col+=parseInt(ch);
                else {
                    const idx = r*8+col;
                    board[idx] = PIECE_UNICODE[ch];
                    colors[idx] = (ch===ch.toUpperCase()) ? 0 : 1;
                    col++;
                }
            }
        }
        return { board, colors, activeColor: parts[1]==='w'?0:1, castling: parts[2], enPassant: parts[3]!=='-'?algebraicToIndex(parts[3]):-1 };
    }
    function toFEN(state) {
        let fen='';
        for (let r=0; r<8; r++) { let empty=0; for (let c=0; c<8; c++) { const idx=r*8+c; const piece=state.board[idx]; if (piece) { if(empty>0) fen+=empty; empty=0; const letter = Object.keys(PIECE_UNICODE).find(k=>PIECE_UNICODE[k]===piece); fen+=letter; } else empty++; } if(empty>0) fen+=empty; if(r<7) fen+='/'; }
        fen+=' '+(state.activeColor===0?'w':'b')+' ';
        fen+=state.castling||'-';
        fen+=' '+(state.enPassant>=0?indexToAlgebraic(state.enPassant):'-');
        fen+=' '+(state.fiftyMove||0)+' '+(state.fullMove||1);
        return fen;
    }
    function indexToAlgebraic(i) { return String.fromCharCode(97+i%8)+(8-Math.floor(i/8)); }
    function algebraicToIndex(s) { const f=s.charCodeAt(0)-97; const r=8-parseInt(s[1]); return r*8+f; }
    function rank(i) { return Math.floor(i/8); }
    function file(i) { return i%8; }
    return { PIECE_UNICODE, parseFEN, toFEN, indexToAlgebraic, algebraicToIndex, rank, file };
})();
