window.PieceSkins = (function() {
    const SKINS = {
        neo: 'style-neo',
        standard: 'style-standard',
        minimal: 'style-minimal'
    };
    let current = 'neo';

    function apply(skin) {
        if (!SKINS[skin]) return;
        current = skin;
        const board = document.getElementById('board');
        if (board) {
            board.classList.remove(...Object.values(SKINS));
            board.classList.add(SKINS[skin]);
        }
        localStorage.setItem('chesszerd_piece_skin', current);
    }

    function getCurrent() { return current; }

    // При загрузке
    const saved = localStorage.getItem('chesszerd_piece_skin');
    if (saved && SKINS[saved]) current = saved;
    if (document.readyState === 'complete') apply(current);
    else window.addEventListener('DOMContentLoaded', () => apply(current));

    return { apply, getCurrent };
})();
