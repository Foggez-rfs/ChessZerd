window.AITest = (function() {
  function runAll() {
    const assert = (cond, msg) => { if (!cond) throw new Error("Test failed: " + msg); };
    const state = window.BoardState.getState();
    const move = window.searchBestMove(state, 2);
    assert(move !== null, "AI returns a move");
    console.log("AI tests passed");
  }
  return { runAll };
})();
