window.MilestoneTracker = (function() {
    function getMilestones() {
        const stats = window.PlayerStats.getStats();
        return [
            { label: 'Побед до 50', current: stats.wins, target: 50 },
            { label: 'ELO до 1500', current: stats.elo, target: 1500 },
            { label: 'Игр до 100', current: stats.totalGames, target: 100 }
        ];
    }
    return { getMilestones };
})();
