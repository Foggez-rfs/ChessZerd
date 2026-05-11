window.ShakeEffect = (function() {
    function shake(el) {
        el.style.animation = 'none';
        el.offsetHeight; // reflow
        el.style.animation = 'shake 0.3s ease';
    }
    return { shake };
})();
