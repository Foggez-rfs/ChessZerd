window.LanguageDetector = (function() {
  function detect() {
    const stored = localStorage.getItem('chesszerd_lang');
    if (stored) return stored;
    const browserLang = (navigator.language || navigator.userLanguage || '').split('-')[0];
    return ['ru','en'].includes(browserLang) ? browserLang : 'ru';
  }
  return { detect };
})();
