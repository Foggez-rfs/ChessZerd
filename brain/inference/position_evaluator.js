window.PositionEvaluator = (function() {
    const NN = window.NNCore;
    const Encoder = window.BoardEncoder;
    function evaluate(state) {
        const input = Encoder.encode(state);
        return NN.forward(input);
    }
    return { evaluate };
})();
