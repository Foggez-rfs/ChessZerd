window.HistoryHeuristic = (function() {
    const history = {};

    function addHistory(move, depth) {
        const key = move.piece + move.from + move.to;
        if (!history[key]) history[key] = 0;
        history[key] += depth * depth;
    }

    function getHistory(move) {
        const key = move.piece + move.from + move.to;
        return history[key] || 0;
    }

    return { addHistory, getHistory, historyTable: history };
})();
// Связываем с MoveOrdering
window.MoveOrdering.historyTable = window.HistoryHeuristic.history;
