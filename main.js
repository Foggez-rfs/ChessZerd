// main.js - точка инициализации Chesszerd
(function() {
  'use strict';

  // Сначала загружаем конфигурации
  window.AppConfig = window.AppConfig || {};
  window.EngineConfig = window.EngineConfig || {};
  window.UIConfig = window.UIConfig || {};
  window.FeatureFlags = window.FeatureFlags || {};

  // Инициализация логгера
  window.Logger?.setLevel(window.AppConfig.logLevel || 'warn');

  // Подгружаем переводы в менеджер
  if (window.TranslationManager && window.TranslationsRU && window.TranslationsEN) {
    window.TranslationManager.setLanguage(window.LanguageDetector.detect());
  }

  // Загрузка дебютной книги
  if (window.OpeningBook && window.OpeningBookFull) {
    window.OpeningBook.load(window.OpeningBookFull);
  }

  // Если не в WebView, регистрируем Service Worker
  if ('serviceWorker' in navigator && window.AppConfig.serviceWorkerEnabled) {
    navigator.serviceWorker.register('/sw.js').catch(() => {});
  }

  // Сигнализируем, что ядро готово
  window.EventBus?.emit('core:ready');
})();
