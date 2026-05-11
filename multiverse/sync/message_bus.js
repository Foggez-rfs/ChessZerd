window.MessageBus = (function() {
  // Используем тот же EventBus, но для воркеров
  const bus = window.EventBus;
  return {
    post: (msg, data) => bus.emit(msg, data),
    subscribe: (msg, cb) => bus.on(msg, cb)
  };
})();
