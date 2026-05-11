window.TermuxAdapter = (function() {
  const isTermux = typeof TermuxAPI !== 'undefined';
  function exec(cmd) { if (isTermux && TermuxAPI.execute) TermuxAPI.execute(cmd); }
  return { isTermux, exec };
})();
