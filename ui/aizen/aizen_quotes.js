window.AizenQuotes = (function() {
    // Более полный список будет загружаться из data/quotes/
    return { get: (lang) => window.AizenPersonality.getQuote(lang) };
})();
