window.SoundPacks = (function() {
    const PACKS = {
        default: { move: 800, capture: 300, check: 1000 },
        retro: { move: 440, capture: 220, check: 880 }
    };
    let current = 'default';

    function setPack(name) {
        if (PACKS[name]) {
            current = name;
            localStorage.setItem('chesszerd_sound_pack', name);
        }
    }

    function getPack() { return PACKS[current]; }

    const saved = localStorage.getItem('chesszerd_sound_pack');
    if (saved && PACKS[saved]) current = saved;

    return { setPack, getPack };
})();
