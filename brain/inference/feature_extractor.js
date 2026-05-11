window.FeatureExtractor = (function() {
    function extract(state) {
        return window.BoardEncoder.encode(state);
    }
    return { extract };
})();
