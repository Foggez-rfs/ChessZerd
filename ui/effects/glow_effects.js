window.GlowEffects = (function() {
    function glowElement(el, color) {
        el.style.boxShadow = `0 0 20px ${color}`;
        setTimeout(() => { el.style.boxShadow = ''; }, 500);
    }
    return { glowElement };
})();
