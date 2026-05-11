window.LocalStorageManager = (function() {
  function available() { try { localStorage.setItem('t','1'); return localStorage.getItem('t')==='1'; } catch(e) { return false; } }
  return { available };
})();
