window.WelcomeScreen = (function() {
    function show(imageUrl, text, durationMs = 2000) {
        const existing = document.getElementById('welcomeScreen');
        if (existing) existing.remove();

        const div = document.createElement('div');
        div.id = 'welcomeScreen';
        div.className = 'welcome-screen';
        div.innerHTML = `
            <div class="welcome-portrait"><img src="${imageUrl}" alt="Aizen" width="150" height="150"></div>
            <div class="welcome-text">
                <div>Chesszerd</div>
                <div style="font-size:0.7em;margin-top:10px;">${text}</div>
            </div>
        `;
        document.body.appendChild(div);
        setTimeout(() => {
            div.style.opacity = '0';
            setTimeout(() => div.remove(), 1000);
        }, durationMs);
    }
    return { show };
})();
