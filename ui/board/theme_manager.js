window.ThemeManager = (function() {
    const themes = {
        wood:      { light: '#f0d9b5', dark: '#b58863', accent: '#c8a96e' },
        classic:   { light: '#ffce9e', dark: '#d18b47', accent: '#e8ab6e' },
        night:     { light: '#1a1a2e', dark: '#0f0f1a', accent: '#4a4a8e' },
        neon:      { light: '#1a0033', dark: '#0d001a', accent: '#ff00ff' }
    };

    let current = 'wood';

    function apply(theme) {
        current = theme || current;
        const t = themes[current];
        if (!t) return;
        const root = document.documentElement;
        root.style.setProperty('--light-square', t.light);
        root.style.setProperty('--dark-square', t.dark);
        root.style.setProperty('--accent', t.accent);
        localStorage.setItem('chesszerd_theme', current);
    }

    function getCurrent() { return current; }

    // Применить сохранённую тему при загрузке
    const saved = localStorage.getItem('chesszerd_theme');
    if (saved && themes[saved]) current = saved;
    apply(current);

    return { apply, getCurrent };
})();
