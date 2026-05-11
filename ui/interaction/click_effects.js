window.ClickEffects = (function() {
    function playClick() {
        try {
            const a = new (window.AudioContext||window.webkitAudioContext)();
            const o = a.createOscillator();
            const g = a.createGain();
            o.connect(g); g.connect(a.destination);
            o.frequency.value = 600;
            o.type = 'sine';
            g.gain.value = 0.05;
            o.start();
            g.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.05);
            o.stop(a.currentTime + 0.05);
        } catch(e) {}
    }
    return { playClick };
})();
