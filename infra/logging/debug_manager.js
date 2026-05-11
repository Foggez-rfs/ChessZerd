window.DebugManager = (function() {
  let enabled = false;
  function enable() { enabled = true; Logger.setLevel('debug'); }
  function disable() { enabled = false; Logger.setLevel('warn'); }
  function isEnabled() { return enabled; }
  function inspect(obj) { return JSON.stringify(obj, null, 2); }
  return { enable, disable, isEnabled, inspect };
})();
