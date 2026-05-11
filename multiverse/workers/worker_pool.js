window.WorkerPool = (function() {
  let pool = [];
  function create(count, script) {
    pool = [];
    for (let i=0; i<count; i++) {
      try { pool.push(new Worker(script)); } catch(e) {}
    }
  }
  function get() { return pool.length ? pool.shift() : null; }
  function release(worker) { pool.push(worker); }
  return { create, get, release };
})();
