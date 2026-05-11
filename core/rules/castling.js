window.Castling = (function() {
  function getRookFrom(move) { return move.castle === 'kingside' ? move.from+3 : move.from-4; }
  function getRookTo(move) { return move.castle === 'kingside' ? move.from+1 : move.from-1; }
  return { getRookFrom, getRookTo };
})();
