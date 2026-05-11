window.SeasonManager = (function() {
    let currentSeason = 1;
    function getCurrentSeason() { return currentSeason; }
    function newSeason() { currentSeason++; }
    return { getCurrentSeason, newSeason };
})();
