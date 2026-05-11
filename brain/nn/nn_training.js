// brain/nn/nn_training.js
window.NNTraining = (function() {
    const NN = window.NNCore;
    let replayBuffer = [];
    const MAX_BUFFER = 10000;

    function addExperience(encodedBoard, targetScore) {
        replayBuffer.push({ input: encodedBoard, target: targetScore });
        if (replayBuffer.length > MAX_BUFFER) replayBuffer.shift();
    }

    function sampleBatch(batchSize = 32) {
        const batch = [];
        for (let i = 0; i < batchSize && replayBuffer.length > 0; i++) {
            const idx = Math.floor(Math.random() * replayBuffer.length);
            batch.push(replayBuffer[idx]);
        }
        return batch;
    }

    function trainOnBuffer(epochs = 1, batchSize = 32, lr = 0.001) {
        for (let e = 0; e < epochs; e++) {
            const batch = sampleBatch(batchSize);
            if (batch.length === 0) return;
            for (let ex of batch) {
                NN.train(ex.input, ex.target, lr);
            }
        }
    }

    function clearBuffer() { replayBuffer = []; }

    return { addExperience, trainOnBuffer, clearBuffer, sampleBatch };
})();
