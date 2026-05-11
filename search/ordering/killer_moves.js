window.KillerMoves = (function() {
    const killers = []; // массив на глубину (ply)

    function addKiller(move, ply) {
        if (!killers[ply]) killers[ply] = [];
        if (!killers[ply].some(k => k.from === move.from && k.to === move.to)) {
            killers[ply].unshift(move);
            if (killers[ply].length > 2) killers[ply].pop();
        }
    }

    function getKillers(ply) {
        return killers[ply] || [];
    }

    return { addKiller, getKillers };
})();
// Связываем с MoveOrdering
window.MoveOrdering.killerMoves = window.KillerMoves.getKillers.bind(window.KillerMoves);
