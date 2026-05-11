window.StringUtils = {
  capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); },
  truncate(s, len) { return s.length > len ? s.substring(0, len) + '...' : s; },
  parseTime(ms) { const sec = Math.floor(ms/1000); return `${Math.floor(sec/60)}:${(sec%60).toString().padStart(2,'0')}`; }
};
