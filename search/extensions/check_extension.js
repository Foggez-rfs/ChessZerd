window.CheckExtension = (function() {
    function extend(state, ply) {
        // Продление на 1 при шахе (не более 2 продлений за ветку)
        return (ply < 2) ? 1 : 0;
    }
    return { extend };
})();
