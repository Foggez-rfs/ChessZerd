window.TranslationManager = (function() {
  const translations = { ru: window.RuTranslations, en: window.EnTranslations };
  let currentLang = window.LanguageDetector.detect();

  function get(key) {
    return (translations[currentLang] && translations[currentLang][key]) || key;
  }

  function setLanguage(lang) {
    if (translations[lang]) {
      currentLang = lang;
      localStorage.setItem('chesszerd_lang', lang);
      window.EventBus?.emit(window.UIEvents?.LANGUAGE_CHANGE, lang);
    }
  }

  function getLanguage() { return currentLang; }

  return { get, setLanguage, getLanguage };
})();
