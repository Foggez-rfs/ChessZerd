window.TimeUtils = {
  now() { return Date.now(); },
  formatDate(ms) { return new Date(ms).toLocaleDateString(); },
  sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
};
