window.MathUtils = {
  clamp(val, min, max) { return Math.max(min, Math.min(max, val)); },
  lerp(a, b, t) { return a + (b - a) * t; },
  sigmoid(x) { return 1 / (1 + Math.exp(-x)); },
  randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; },
  randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
};
