window.ShareManager = (function() {
    function shareText(text) {
        if (navigator.share) {
            navigator.share({ text }).catch(() => {});
        } else {
            // fallback: копирование в буфер
            if (navigator.clipboard) {
                navigator.clipboard.writeText(text);
                alert('Текст скопирован!');
            }
        }
    }
    function shareGameResult(result) {
        const msg = `Только что сыграл партию в Chesszerd! Результат: ${result}. Мой рейтинг: ${window.PlayerStats.getStats().elo} #Chesszerd`;
        shareText(msg);
    }
    return { shareText, shareGameResult };
})();
