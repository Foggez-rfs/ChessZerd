window.ELORating = (function() {
    const K_FACTOR = 32;

    function expectedScore(ratingA, ratingB) {
        return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
    }

    function updateRating(playerElo, opponentElo, result) {
        // result: 1 = win, 0 = loss, 0.5 = draw
        const expected = expectedScore(playerElo, opponentElo);
        const newElo = Math.round(playerElo + K_FACTOR * (result - expected));
        return Math.max(100, newElo);
    }

    return { expectedScore, updateRating };
})();
