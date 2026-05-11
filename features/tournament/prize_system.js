window.PrizeSystem = (function() {
    function getPrize(place) {
        if (place === 1) return 'Трофей Айзена + 50 ELO';
        if (place === 2) return 'Серебряная медаль + 25 ELO';
        if (place === 3) return 'Бронзовая медаль + 10 ELO';
        return 'Участие';
    }
    return { getPrize };
})();
