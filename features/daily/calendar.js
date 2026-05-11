window.Calendar = (function() {
    const STORAGE_KEY = 'chesszerd_calendar';
    let completedDays = {};

    function load() {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) completedDays = JSON.parse(saved);
    }

    function markDay(dateStr) {
        completedDays[dateStr] = true;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(completedDays));
    }

    function isDayCompleted(dateStr) {
        return !!completedDays[dateStr];
    }

    load();
    return { markDay, isDayCompleted };
})();
