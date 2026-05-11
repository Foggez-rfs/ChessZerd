window.PuzzleGenerator = (function() {
    // Использует данные из data/puzzles при наличии, иначе заглушки
    function getPuzzle(type) {
        switch(type) {
            case 'mateIn1': return { fen: 'rnbqkbnr/pppp1ppp/8/4p3/4P3/8/PPPPKPPP/RNBQ1BNR w kq - 0 1', moves: ['f3'] };
            case 'mateIn2': return { fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 0 1', moves: ['Qf7'] };
            default: return null;
        }
    }
    return { getPuzzle };
})();
