window.AchievementList = [
    { id: 'first_win', name: 'Первая победа', desc: 'Выиграйте первую партию', icon: '🏆', condition: (s) => s.wins >= 1 },
    { id: 'ten_wins', name: 'Победитель', desc: 'Выиграйте 10 партий', icon: '🥇', condition: (s) => s.wins >= 10 },
    { id: 'streak_3', name: 'На ходу', desc: 'Достигните серии из 3 побед', icon: '🔥', condition: (s) => s.bestStreak >= 3 },
    { id: 'streak_10', name: 'Неудержимый', desc: 'Достигните серии из 10 побед', icon: '💥', condition: (s) => s.bestStreak >= 10 },
    { id: 'games_100', name: 'Ветеран', desc: 'Сыграйте 100 партий', icon: '🎖️', condition: (s) => s.totalGames >= 100 },
    { id: 'elo_1500', name: 'Разрядник', desc: 'Достигните рейтинга 1500', icon: '⭐', condition: (s) => s.elo >= 1500 },
    { id: 'elo_2000', name: 'Мастер', desc: 'Достигните рейтинга 2000', icon: '🌟', condition: (s) => s.elo >= 2000 },
];
