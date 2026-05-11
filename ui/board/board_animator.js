window.BoardAnimator = (function() {
    function animateMove(from, to, callback) {
        // Заглушка: просто мгновенное обновление
        if (callback) callback();
    }
    return { animateMove };
})();
