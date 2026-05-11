window.PlayerStats = (function() {
    const profile = window.PlayerProfile;

    function getStats() {
        const p = profile.get();
        return {
            name: p.name,
            elo: p.elo,
            wins: p.wins,
            losses: p.losses,
            draws: p.draws,
            streak: p.streak,
            bestStreak: p.bestStreak,
            totalGames: p.totalGames,
            winRate: p.totalGames ? Math.round((p.wins / p.totalGames) * 100) : 0
        };
    }

    function getRank(elo) {
        if (elo < 1000) return 'Новичок';
        if (elo < 1200) return 'Любитель';
        if (elo < 1400) return 'Разрядник';
        if (elo < 1600) return 'Кандидат в мастера';
        if (elo < 1800) return 'Мастер';
        if (elo < 2000) return 'Международный мастер';
        if (elo < 2200) return 'Гроссмейстер';
        return 'Сверхгроссмейстер';
    }

    return { getStats, getRank };
})();
