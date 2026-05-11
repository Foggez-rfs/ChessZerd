window.BadgeRenderer = (function() {
    function render(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        const achieved = window.AchievementSystem.getUnlocked();
        container.innerHTML = achieved.map(a => 
            `<span title="${a.name}: ${a.desc}" style="font-size:24px;margin:4px;">${a.icon}</span>`
        ).join('');
    }
    return { render };
})();
