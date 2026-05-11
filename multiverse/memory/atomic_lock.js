window.AtomicLock = (function() {
  // Атомарные операции только с SharedArrayBuffer, иначе заглушка
  function lock(buffer, index) {
    if (buffer instanceof SharedArrayBuffer) {
      // упрощённый спинлок
      while (new Int32Array(buffer)[index] === 1) {}
      new Int32Array(buffer)[index] = 1;
    }
  }
  function unlock(buffer, index) {
    if (buffer instanceof SharedArrayBuffer) new Int32Array(buffer)[index] = 0;
  }
  return { lock, unlock };
})();
