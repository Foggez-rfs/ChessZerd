window.Benchmark = (function() {
  function runSearchBenchmark(depth = 3) {
    const state = window.BoardState.getState();
    const start = performance.now();
    const move = window.searchBestMove(state, depth);
    const time = performance.now() - start;
    console.log(`Search depth ${depth} took ${time.toFixed(0)} ms, move: ${move?.from}-${move?.to}`);
    return time;
  }
  return { runSearchBenchmark };
})();
