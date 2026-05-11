window.AizenAvatar = (function() {
    function render(containerId, size = 150) {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<img src="portrait.jpg" alt="Aizen" width="${size}" height="${size}" style="border-radius:50%;object-fit:cover;">`;
        }
    }
    return { render };
})();
