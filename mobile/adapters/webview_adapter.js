window.WebViewAdapter = (function() {
  const isWebView = /(Android|WebView|Version\/.+(Mobile|wv)).+Chrome/.test(navigator.userAgent);
  function getPlatform() { return { isWebView, isAndroid: /Android/.test(navigator.userAgent), isTermux: !!window.TermuxAPI, isStandalone: isWebView }; }
  function safeStorage() { try { localStorage.setItem('test','1'); return true; } catch(e) { return false; } }
  return { getPlatform, safeStorage };
})();
