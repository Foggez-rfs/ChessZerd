window.ProfilePanel = (function() {
    function updateStats(elo, wins, losses, draws) {
        document.getElementById('playerElo').textContent = elo;
        document.getElementById('playerWins').textContent = wins;
        document.getElementById('playerLosses').textContent = losses;
        document.getElementById('playerDraws').textContent = draws;
    }
    function getName() { return document.getElementById('playerName').value; }
    function setName(name) { document.getElementById('playerName').value = name; }
    return { updateStats, getName, setName };
})();
