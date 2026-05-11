window.EngineConfig = {
  // Параметры поиска
  search: {
    maxDepth: 4,
    quiescenceDepth: 2,
    aspirationWindow: 50,
    nullMoveReduction: 2,
    lateMoveReductionBase: 1,
    futilityMargin: 100,
    razorMargin: 500,
    checkExtension: 1,
    recaptureExtension: 1,
    pawnPushExtension: 1,
    useSEE: true,
    useHistory: true,
    useKillers: true
  },
  // Нейросеть
  nn: {
    inputSize: 768,
    hidden1: 256,
    hidden2: 64,
    outputSize: 1,
    keepWeightsInLocalStorage: true,
    autoSaveIntervalMs: 60000
  },
  // Дебютная книга
  opening: {
    bookEnabled: true,
    maxBookDepth: 8,
    randomVariation: true
  }
};
