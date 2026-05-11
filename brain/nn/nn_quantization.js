// brain/nn/nn_quantization.js
window.NNQuantization = (function() {
    function quantize(weights, bits = 8) {
        // Заглушка: в будущем сжатие весов
        return weights;
    }
    function dequantize(qWeights) {
        return qWeights;
    }
    return { quantize, dequantize };
})();
