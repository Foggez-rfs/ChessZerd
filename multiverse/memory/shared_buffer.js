window.SharedBuffer = (function() {
  // SharedArrayBuffer в WebView может быть недоступен из-за CORS, используем заглушку
  let buffer = null;
  function create(size) {
    if (typeof SharedArrayBuffer !== 'undefined') buffer = new SharedArrayBuffer(size);
    else buffer = new ArrayBuffer(size); // fallback
    return buffer;
  }
  return { create };
})();
