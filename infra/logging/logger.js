window.Logger = (function() {
  const LOG_LEVELS = { debug: 0, info: 1, warn: 2, error: 3, none: 4 };
  let currentLevel = LOG_LEVELS.warn;

  function setLevel(level) { currentLevel = LOG_LEVELS[level] || LOG_LEVELS.warn; }

  function log(level, message, data) {
    if (LOG_LEVELS[level] < currentLevel) return;
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}][${level.toUpperCase()}]`;
    if (data !== undefined) {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](prefix, message, data);
    } else {
      console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](prefix, message);
    }
  }

  return {
    debug: (msg, data) => log('debug', msg, data),
    info: (msg, data) => log('info', msg, data),
    warn: (msg, data) => log('warn', msg, data),
    error: (msg, data) => log('error', msg, data),
    setLevel,
    LOG_LEVELS
  };
})();
