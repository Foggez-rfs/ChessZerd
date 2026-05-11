window.CheckTest = (function() {
  function runAll() {
    const assert = (cond, msg) => { if (!cond) throw new Error("Test failed: " + msg); };
    const Check = window.CheckDetector;
    const state = window.BoardState.getState();
    assert(!Check.isKingInCheck(state, 0), "White not in check initially");
    console.log("Check tests passed");
  }
  return { runAll };
})();
