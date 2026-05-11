window.RankSystem = (function() {
    const RANKS = [
        { name: 'Новичок', min: 0 },
        { name: 'Любитель', min: 1000 },
        { name: 'Разрядник', min: 1200 },
        { name: 'Кандидат в мастера', min: 1400 },
        { name: 'Мастер', min: 1600 },
        { name: 'Международный мастер', min: 1800 },
        { name: 'Гроссмейстер', min: 2000 },
        { name: 'Легенда', min: 2200 }
    ];

    function getRank(elo) {
        for (let i = RANKS.length - 1; i >= 0; i--) {
            if (elo >= RANKS[i].min) return RANKS[i];
        }
        return RANKS[0];
    }

    function nextRankProgress(elo) {
        const current = getRank(elo);
        const nextIndex = RANKS.indexOf(current) + 1;
        if (nextIndex >= RANKS.length) return { next: null, progress: 100 };
        const next = RANKS[nextIndex];
        const progress = ((elo - current.min) / (next.min - current.min)) * 100;
        return { next: next.name, progress: Math.min(100, Math.round(progress)) };
    }

    return { getRank, nextRankProgress };
})();
