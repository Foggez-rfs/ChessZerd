window.ModalDialog = (function() {
    function show(title, message, onClose) {
        alert(title + ': ' + message); // простой fallback
    }
    return { show };
})();
