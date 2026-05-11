window.CordovaBridge = (function() {
  const isCordova = !!window.cordova;
  let deviceReady = false;
  function onDeviceReady(cb) {
    if (deviceReady) { cb(); return; }
    document.addEventListener('deviceready', () => { deviceReady = true; cb(); }, false);
  }
  return { isCordova, onDeviceReady };
})();
