window.CacheManager = (function() {
  function clearAll() {
    localStorage.clear();
    // очистить IndexedDB если нужно
  }
  return { clearAll };
})();
