window.AchievementSystem = (function() {
    const STORAGE_KEY = 'chesszerd_achievements';
    let unlocked = {};

    function load() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) unlocked = JSON.parse(saved);
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(unlocked));
    }

    function checkAndUnlock(stats) {
        const newAchievements = [];
        window.AchievementList.forEach(a => {
            if (!unlocked[a.id] && a.condition(stats)) {
                unlocked[a.id] = Date.now();
                newAchievements.push(a);
            }
        });
        if (newAchievements.length > 0) save();
        return newAchievements;
    }

    function getUnlocked() {
        return window.AchievementList.filter(a => unlocked[a.id]);
    }

    function getProgress() {
        const total = window.AchievementList.length;
        const done = Object.keys(unlocked).length;
        return { done, total, percent: Math.round((done/total)*100) };
    }

    load();
    return { checkAndUnlock, getUnlocked, getProgress };
})();
