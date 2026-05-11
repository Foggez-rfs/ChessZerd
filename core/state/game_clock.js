window.GameClock = (function() {
  let whiteTime = 0, blackTime = 0, increment = 0;
  let startTime = 0, running = false, currentColor = 0;
  function setTime(seconds, inc = 0) { whiteTime = blackTime = seconds*1000; increment = inc*1000; }
  function start() { if (!running) { startTime = Date.now(); running = true; } }
  function stop() { if (running) { const elapsed = Date.now() - startTime; if (currentColor===0) whiteTime -= elapsed; else blackTime -= elapsed; running = false; } }
  function switchColor() { stop(); currentColor = 1-currentColor; start(); }
  function getTimes() { return { white: whiteTime, black: blackTime }; }
  return { setTime, start, stop, switchColor, getTimes };
})();
