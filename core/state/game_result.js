window.GameResult = (function() {
  function determine(state) {
    const moves = window.MoveValidator.getAllLegalMoves(state);
    if (moves.length === 0) {
      const inCheck = window.CheckDetector.isKingInCheck(state, state.activeColor);
      return inCheck ? (state.activeColor === 0 ? '0-1' : '1-0') : '1/2-1/2';
    }
    // Дополнительно: 50 ходов, троекратное повторение (пока не реализовано)
    return null;
  }
  return { determine };
})();
