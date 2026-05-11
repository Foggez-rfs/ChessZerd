window.CPUThrottle = (function() {
  // Заглушка: управление частотой поиска в зависимости от заряда батареи
  let throttleFactor = 1;
  function adjust() {
    const battery = window.BatteryMonitor?.level || 1;
    throttleFactor = battery < 0.2 ? 0.5 : battery < 0.5 ? 0.8 : 1;
  }
  return { get factor() { adjust(); return throttleFactor; } };
})();
