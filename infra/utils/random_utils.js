window.RandomUtils = {
  seed(seed) { Math.seedrandom?.(seed); }, // если загружен seedrandom, иначе игнорим
  random() { return Math.random(); }
};
