window.TranspositionTable = (function() {
  const table = {};
  function get(key) { return table[key]; }
  function set(key, value) { table[key] = value; }
  function clear() { for (let k in table) delete table[k]; }
  return { get, set, clear };
})();
