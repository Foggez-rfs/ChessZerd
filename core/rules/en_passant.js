window.EnPassant = (function() {
  function getCapturedIndex(move, color) { return color === 0 ? move.to + 8 : move.to - 8; }
  return { getCapturedIndex };
})();
