window.BoardTest = (function() {
  function runAll() {
    const assert = (cond, msg) => { if (!cond) throw new Error("Test failed: " + msg); };
    const B = window.BitboardCore;
    assert(B.parseFEN(B.START_FEN).board.length === 64, "FEN parse board length");
    assert(B.indexToAlgebraic(0) === "a8", "index to algebraic a8");
    assert(B.algebraicToIndex("a8") === 0, "algebraic to index a8");
    console.log("Board tests passed");
  }
  return { runAll };
})();
