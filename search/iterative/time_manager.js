window.TimeManager = (function() {
    let startTime = 0;
    let allocated = 0;

    function start(seconds) {
        startTime = Date.now();
        allocated = seconds * 1000;
    }

    function shouldStop() {
        return Date.now() - startTime >= allocated;
    }

    function remainingMs() {
        return Math.max(0, allocated - (Date.now() - startTime));
    }

    return { start, shouldStop, remainingMs };
})();
