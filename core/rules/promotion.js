window.Promotion = (function() {
  function isPromotion(move, board) {
    const piece = board[move.from];
    return (piece === '♙' && Math.floor(move.to/8) === 0) || (piece === '♟' && Math.floor(move.to/8) === 7);
  }
  return { isPromotion };
})();
