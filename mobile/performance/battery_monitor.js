window.BatteryMonitor = (function() {
  let level = 1, charging = false;
  if (navigator.getBattery) {
    navigator.getBattery().then(battery => {
      level = battery.level; charging = battery.charging;
      battery.addEventListener('levelchange', () => level = battery.level);
      battery.addEventListener('chargingchange', () => charging = battery.charging);
    });
  }
  return { get level() { return level; }, get charging() { return charging; } };
})();
