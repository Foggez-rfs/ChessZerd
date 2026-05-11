window.LanguageManager = (function() {
    const LANGUAGES = ['ru', 'en'];
    let current = localStorage.getItem('chesszerd_lang') || 'ru';

    function set(lang) {
        if (LANGUAGES.includes(lang)) {
            current = lang;
            localStorage.setItem('chesszerd_lang', lang);
            // Вызвать обновление UI (будет в app.js)
            if (window.updateUILanguage) window.updateUILanguage(lang);
        }
    }

    function get() { return current; }

    return { set, get };
})();
