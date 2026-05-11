window.ResultCollector = (function() {
  const results = [];
  function add(result) { results.push(result); }
  function get() { return results.slice(); }
  function clear() { results.length = 0; }
  return { add, get, clear };
})();
