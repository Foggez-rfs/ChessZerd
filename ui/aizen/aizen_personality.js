window.AizenPersonality = (function() {
    const quotes = {
        ru: ["Добро пожаловать в мой мир.","Твои ходы предсказуемы."],
        en: ["Welcome to my world.","Your moves are predictable."]
    };
    function getQuote(lang) {
        const list = quotes[lang] || quotes.ru;
        return list[Math.floor(Math.random() * list.length)];
    }
    return { getQuote };
})();
