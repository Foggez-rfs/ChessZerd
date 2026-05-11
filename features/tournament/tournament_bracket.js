window.TournamentBracket = (function() {
    let players = [];
    let rounds = [];

    function generate(participants) {
        players = [...participants];
        // Перемешивание
        for (let i = players.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [players[i], players[j]] = [players[j], players[i]];
        }
        // Простая сетка (4 игрока -> полуфиналы, 8 -> четвертьфиналы)
        rounds = [];
        while (players.length > 1) {
            const newRound = [];
            for (let i = 0; i < players.length; i += 2) {
                if (i + 1 < players.length) {
                    newRound.push({ p1: players[i], p2: players[i+1], winner: null });
                } else {
                    newRound.push({ p1: players[i], p2: null, winner: players[i] }); // bye
                }
            }
            rounds.push(newRound);
            players = newRound.map(m => m.winner).filter(Boolean);
        }
        return rounds;
    }

    function getCurrentRound() { return rounds[0] || []; }
    function advanceWinner(matchIndex) {
        if (rounds.length === 0) return null;
        const current = rounds[0]; // это ссылка, ок
        const match = current[matchIndex];
        if (!match) return null;
        // Имитация выбора победителя — в реальности будет вызываться после игры
        match.winner = match.p1; // заглушка: побеждает первый игрок
        // Если все матчи в раунде завершены, формируем следующий раунд
        if (current.every(m => m.winner)) {
            const winners = current.map(m => m.winner);
            rounds.shift();
            if (winners.length > 1) {
                const newRound = [];
                for (let i = 0; i < winners.length; i += 2) {
                    if (i + 1 < winners.length) {
                        newRound.push({ p1: winners[i], p2: winners[i+1], winner: null });
                    } else {
                        newRound.push({ p1: winners[i], p2: null, winner: winners[i] });
                    }
                }
                rounds.unshift(newRound);
            }
        }
        return match.winner;
    }

    return { generate, getCurrentRound, advanceWinner };
})();
