window.DeltaPruning = (function() {
    // В квисенсе: если стат.оценка + ценность фигуры не дотягивает до альфа, пропускаем
    function isPruned(staticEval, alpha, pieceValue) {
        return staticEval + pieceValue + 200 <= alpha; // запас
    }
    return { isPruned };
})();
