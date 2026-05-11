window.MemoryMonitor = (function() {
  function getUsage() { return performance?.memory?.usedJSHeapSize || 0; }
  function getLimit() { return performance?.memory?.jsHeapSizeLimit || 0; }
  return { getUsage, getLimit };
})();
