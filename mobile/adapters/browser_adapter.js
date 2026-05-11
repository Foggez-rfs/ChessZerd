window.BrowserAdapter = (function() {
  const isBrowser = typeof window !== 'undefined' && !window.WebViewAdapter?.getPlatform().isWebView;
  return { isBrowser };
})();
