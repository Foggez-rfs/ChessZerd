window.NativeInvoke = (function() {
  function vibrate(ms) { if (navigator.vibrate) navigator.vibrate(ms); }
  return { vibrate };
})();
