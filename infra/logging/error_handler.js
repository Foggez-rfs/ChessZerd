window.ErrorHandler = (function() {
  function handle(exception) {
    window.Logger?.error("Unhandled exception", exception);
    if (navigator.vibrate) navigator.vibrate(50);
    // Не выводим alert, чтобы не сломать игру
  }

  window.addEventListener('error', function(e) {
    handle(e.message || e.error);
  });

  window.addEventListener('unhandledrejection', function(e) {
    handle(e.reason);
  });

  return { handle };
})();
