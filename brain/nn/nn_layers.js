// brain/nn/nn_layers.js
window.NNLayers = (function() {
    function Dense(inputSize, outputSize, activation = 'relu') {
        const std = Math.sqrt(2.0 / inputSize);
        const weights = [];
        for (let i = 0; i < inputSize; i++) {
            weights[i] = new Array(outputSize);
            for (let j = 0; j < outputSize; j++) {
                let u = 0, v = 0;
                while (u === 0) u = Math.random();
                while (v === 0) v = Math.random();
                weights[i][j] = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * std;
            }
        }
        const biases = new Array(outputSize).fill(0);
        return { weights, biases, activation, inputSize, outputSize };
    }

    function forward(layer, input) {
        const { weights, biases, activation } = layer;
        const output = new Array(biases.length);
        for (let j = 0; j < biases.length; j++) {
            let sum = biases[j];
            for (let i = 0; i < input.length; i++) {
                sum += input[i] * weights[i][j];
            }
            if (activation === 'relu') {
                output[j] = sum > 0 ? sum : 0;
            } else if (activation === 'tanh') {
                output[j] = Math.tanh(sum);
            } else {
                output[j] = sum; // linear
            }
        }
        return output;
    }

    return { Dense, forward };
})();
