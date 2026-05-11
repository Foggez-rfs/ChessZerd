window.LoadBalancer = (function() {
  // Распределение задач между воркерами
  let workers = [];
  let next = 0;
  function setWorkers(w) { workers = w; }
  function dispatch(task) {
    if (workers.length === 0) return null;
    const worker = workers[next % workers.length];
    next++;
    return worker;
  }
  return { setWorkers, dispatch };
})();
