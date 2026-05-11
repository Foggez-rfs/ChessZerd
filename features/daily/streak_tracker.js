window.StreakTracker = (function() {
    const STORAGE_KEY = 'chesszerd_streak';
    let streak = 0, lastDate = '';

    function load() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const data = JSON.parse(saved);
                streak = data.streak || 0;
                lastDate = data.lastDate || '';
            } catch(e) {}
        }
    }

    function recordActivity() {
        const today = new Date().toDateString();
        if (lastDate === today) return streak;
        const yesterday = new Date(Date.now() - 86400000).toDateString();
        if (lastDate === yesterday) {
            streak++;
        } else {
            streak = 1;
        }
        lastDate = today;
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ streak, lastDate }));
        return streak;
    }

    function getStreak() { return streak; }

    load();
    return { recordActivity, getStreak };
})();
