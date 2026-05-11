window.MovesTest = (function() {
  function runAll() {
    const assert = (cond, msg) => { if (!cond) throw new Error("Test failed: " + msg); };
    const state = window.BoardState.getState();
    const moves = window.MoveValidator.getAllLegalMoves(state);
    assert(moves.length > 0, "Initial position has moves");
    console.log("Moves tests passed");
  }
  return { runAll };
})();
