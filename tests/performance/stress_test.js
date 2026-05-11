window.StressTest = (function() {
  function run(iterations = 10) {
    console.time("StressTest");
    for (let i=0; i<iterations; i++) {
      window.BoardState.reset();
      for (let j=0; j<10; j++) {
        const moves = window.MoveValidator.getAllLegalMoves(window.BoardState.getState());
        if (moves.length) window.BoardState.makeMove(moves[Math.floor(Math.random()*moves.length)]);
      }
    }
    console.timeEnd("StressTest");
  }
  return { run };
})();
