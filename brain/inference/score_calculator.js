window.ScoreCalculator = (function() {
    function centipawnsToWinProbability(cp) {
        return 1 / (1 + Math.exp(-cp / 400));
    }
    function winProbabilityToEloDiff(prob) {
        return -400 * Math.log(1 / prob - 1);
    }
    return { centipawnsToWinProbability, winProbabilityToEloDiff };
})();
