window.AizenVoice = (function() {
    function speak(text, lang = 'ru') {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = lang === 'ru' ? 'ru-RU' : 'en-US';
            utterance.rate = 0.9;
            utterance.pitch = 0.8;
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        }
    }
    return { speak };
})();
