window.OpponentGenerator = (function() {
    const NAMES = ['Соске Айзен', 'Ичиго Куросаки', 'Рукия Кучики', 'Ренджи Абараи', 'Бьякуя Кучики'];

    function generate(elo) {
        const name = NAMES[Math.floor(Math.random() * NAMES.length)];
        const offset = Math.floor(Math.random() * 400) - 200;
        return { name, elo: Math.max(100, elo + offset) };
    }

    function generateMany(count, elo) {
        const opponents = [];
        for (let i = 0; i < count; i++) {
            opponents.push(generate(elo));
        }
        return opponents;
    }

    return { generate, generateMany };
})();
