window.PGNExport = (function() {
    function exportPGN(moves, result, whiteName, blackName) {
        let pgn = `[Event "Chesszerd Game"]\n[White "${whiteName}"]\n[Black "${blackName}"]\n[Result "${result}"]\n\n`;
        let moveNum = 1;
        for (let i = 0; i < moves.length; i += 2) {
            pgn += `${moveNum}. `;
            pgn += `${moves[i]} `;
            if (moves[i+1]) pgn += `${moves[i+1]} `;
            moveNum++;
        }
        pgn += result;
        return pgn;
    }
    return { exportPGN };
})();
