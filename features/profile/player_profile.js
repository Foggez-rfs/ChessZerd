window.PlayerProfile = (function() {
    const STORAGE_KEY = 'chesszerd_profile';
    let data = {
        name: 'Игрок',
        avatar: 0,           // индекс аватара 0-5
        elo: 1200,
        wins: 0,
        losses: 0,
        draws: 0,
        streak: 0,
        bestStreak: 0,
        totalGames: 0,
        joined: Date.now()
    };

    function load() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                data = { ...data, ...parsed };
            } catch (e) {}
        }
        return data;
    }

    function save() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function get() { return data; }

    function update(changes) {
        Object.assign(data, changes);
        save();
    }

    function addGameResult(result) { // result: 'win', 'loss', 'draw'
        data.totalGames++;
        if (result === 'win') { data.wins++; data.streak++; }
        else if (result === 'loss') { data.losses++; data.streak = 0; }
        else if (result === 'draw') { data.draws++; }
        if (data.streak > data.bestStreak) data.bestStreak = data.streak;
        save();
    }

    // Загрузить при старте
    load();

    return { load, save, get, update, addGameResult };
})();
