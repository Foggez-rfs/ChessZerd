window.GameFlowTest = (function() {
  function runAll() {
    const assert = (cond, msg) => { if (!cond) throw new Error("Test failed: " + msg); };
    const State = window.BoardState;
    State.reset();
    assert(!window.GameState.isGameOver(), "Game not over at start");
    State.makeMove({from: 52, to: 36}); // e2-e4
    State.makeMove({from: 12, to: 28}); // e7-e5
    assert(window.GameState.getResult() === null, "Still no result");
    console.log("Game flow tests passed");
  }
  return { runAll };
})();
