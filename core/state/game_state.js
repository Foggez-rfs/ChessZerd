window.GameState = (function() {
    let result = null; // '1-0', '0-1', '1/2-1/2'
    let over = false;

    function updateResult(state) {
        const moves = window.MoveValidator.getAllLegalMoves(state);
        const inCheck = window.CheckDetector.isKingInCheck(state, state.activeColor);
        if (moves.length === 0) {
            over = true;
            result = inCheck ? (state.activeColor===0 ? '0-1' : '1-0') : '1/2-1/2';
        } else {
            over = false; result = null;
        }
    }
    function isGameOver() { return over; }
    function getResult() { return result; }
    function reset() { over=false; result=null; }
    return { updateResult, isGameOver, getResult, reset };
})();
