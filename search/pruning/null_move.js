window.NullMovePruning = (function() {
    const State = window.BoardState;
    const AlphaBeta = window.AlphaBeta;
    // Null-move reduction: применимо, если не в шахе и есть материал
    function shouldPrune(state, depth) {
        // проверка: не в шахе, глубина > 2
        if (depth < 3) return false;
        if (window.CheckDetector.isKingInCheck(state, state.activeColor)) return false;
        // упрощённо проверяем, что есть фигуры кроме короля
        const board = state.board;
        let pieces = 0;
        for (let i=0; i<64; i++) if (board[i] && board[i] !== '♔' && board[i] !== '♚') pieces++;
        return pieces > 3; // если слишком мало фигур, null-move опасен
    }

    function search(state, depth, alpha, beta, ply) {
        // Делаем null-ход: передаём ход, меняем цвет, без изменения позиции
        const nullState = { ...state, activeColor: 1-state.activeColor, board: [...state.board], colors: [...state.colors] };
        const R = 2; // сокращение
        return -AlphaBeta.search(nullState, depth-1-R, -beta, -beta+1, ply+1);
    }
    return { shouldPrune, search };
})();
