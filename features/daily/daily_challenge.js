window.DailyChallenge = (function() {
    const STORAGE_KEY = 'chesszerd_daily';
    let challenge = null;

    function generate() {
        const puzzles = ['Мат в 1 ход', 'Мат в 2 хода', 'Выигрыш ферзя', 'Проведи пешку'];
        const today = new Date().toDateString();
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            if (data.date === today) return data.challenge;
        }
        const idx = Math.floor(Math.random() * puzzles.length);
        challenge = { text: puzzles[idx], completed: false, date: today };
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ challenge, date: today }));
        return challenge;
    }

    function complete() {
        if (!challenge) return false;
        challenge.completed = true;
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
        saved.challenge = challenge;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
        return true;
    }

    function get() {
        if (!challenge) generate();
        return challenge;
    }

    return { generate, complete, get };
})();
