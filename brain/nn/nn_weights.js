// brain/nn/nn_weights.js
window.NNWeights = (function() {
    const STORAGE_KEY = 'nn_weights_v1';
    function save() {
        window.NNCore.saveWeights(STORAGE_KEY);
    }
    function load() {
        return window.NNCore.loadWeights(STORAGE_KEY);
    }
    function exportWeights() {
        return window.NNCore.exportWeights();
    }
    function importWeights(data) {
        window.NNCore.importWeights(data);
        save();
    }
    // Автозагрузка при старте
    load();
    return { save, load, exportWeights, importWeights };
})();
