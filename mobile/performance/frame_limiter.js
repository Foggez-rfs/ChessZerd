window.FrameLimiter = (function() {
  // Для UI анимаций
  let fps = 30;
  function setFPS(newFPS) { fps = Math.max(10, Math.min(60, newFPS)); }
  function getFrameDelay() { return 1000 / fps; }
  return { setFPS, getFrameDelay };
})();
