window.CrashReporter = (function() {
  // В offline-режиме просто сохраняем в localStorage
  function report(error) {
    const crashes = JSON.parse(localStorage.getItem('chesszerd_crashes') || '[]');
    crashes.push({ time: new Date().toISOString(), message: error.toString(), stack: error.stack });
    localStorage.setItem('chesszerd_crashes', JSON.stringify(crashes.slice(-20)));
  }
  return { report };
})();
