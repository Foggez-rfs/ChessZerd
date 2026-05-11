window.Transition = (function() {
    function fadeOut(el, duration, callback) {
        el.style.transition = `opacity ${duration}ms`;
        el.style.opacity = '0';
        setTimeout(callback, duration);
    }
    return { fadeOut };
})();
