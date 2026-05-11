window.BoardSkins = (function() {
    const SKINS = {
        wood:    { light: '#f0d9b5', dark: '#b58863', accent: '#c8a96e' },
        classic: { light: '#ffce9e', dark: '#d18b47', accent: '#e8ab6e' },
        night:   { light: '#1a1a2e', dark: '#0f0f1a', accent: '#4a4a8e' },
        neon:    { light: '#1a0033', dark: '#0d001a', accent: '#ff00ff' }
    };
    let current = 'wood';

    function apply(skin) {
        if (!SKINS[skin]) return;
        current = skin;
        const t = SKINS[skin];
        const root = document.documentElement;
        root.style.setProperty('--light-square', t.light);
        root.style.setProperty('--dark-square', t.dark);
        root.style.setProperty('--accent', t.accent);
        localStorage.setItem('chesszerd_board_skin', current);
    }

    function getCurrent() { return current; }

    const saved = localStorage.getItem('chesszerd_board_skin');
    if (saved && SKINS[saved]) current = saved;
    apply(current);

    return { apply, getCurrent };
})();
