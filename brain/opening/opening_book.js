window.OpeningBook = (function() {
    const moves = {};
    function load(json) { Object.assign(moves, json); }
    function get(fen) { return moves[fen] || []; }
    return { load, get };
})();
