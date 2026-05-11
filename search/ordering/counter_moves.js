window.CounterMoves = (function() {
    const counter = {}; // от хода к ходу

    function addCounter(prevMove, responseMove) {
        const key = prevMove.from + '-' + prevMove.to;
        counter[key] = responseMove;
    }

    function getCounter(prevMove) {
        const key = prevMove.from + '-' + prevMove.to;
        return counter[key] || null;
    }

    return { addCounter, getCounter };
})();
