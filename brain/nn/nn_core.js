// brain/nn/nn_core.js
// Ядро нейросети Chesszerd — оценка позиции (768 -> 256 -> 64 -> 1)
// Использует глобальный объект window.NNCore
window.NNCore = (function() {
    'use strict';

    // Размеры слоёв
    const INPUT_SIZE = 768;   // 12 плоскостей (6 фигур × 2 цвета) × 64 клетки
    const HIDDEN1_SIZE = 256;
    const HIDDEN2_SIZE = 64;
    const OUTPUT_SIZE = 1;    // оценка в сантипешках (1 пешка = 100)

    // Гиперпараметры
    const LEARNING_RATE = 0.001;
    const L2_REG = 0.0001;    // L2 регуляризация

    // Веса и смещения (инициализируются при создании)
    let W1, b1, W2, b2, W3, b3;

    // Кэш активаций для обратного распространения
    let cache = null;

    // Конструктор (вызывается автоматически при загрузке скрипта)
    function initialize() {
        // Инициализация Xavier/Glorot
        W1 = randomMatrix(INPUT_SIZE, HIDDEN1_SIZE, INPUT_SIZE);
        b1 = new Array(HIDDEN1_SIZE).fill(0);
        W2 = randomMatrix(HIDDEN1_SIZE, HIDDEN2_SIZE, HIDDEN1_SIZE);
        b2 = new Array(HIDDEN2_SIZE).fill(0);
        W3 = randomMatrix(HIDDEN2_SIZE, OUTPUT_SIZE, HIDDEN2_SIZE);
        b3 = new Array(OUTPUT_SIZE).fill(0);
        cache = null;
    }

    // Случайная матрица с нормальным распределением (Xavier)
    function randomMatrix(rows, cols, fanIn) {
        const std = Math.sqrt(2.0 / fanIn);
        const mat = new Array(rows);
        for (let i = 0; i < rows; i++) {
            mat[i] = new Array(cols);
            for (let j = 0; j < cols; j++) {
                // Box-Muller transform для нормального распределения
                let u = 0, v = 0;
                while (u === 0) u = Math.random();
                while (v === 0) v = Math.random();
                mat[i][j] = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * std;
            }
        }
        return mat;
    }

    // Функции активации
    function relu(x) { return x > 0 ? x : 0; }
    function reluDerivative(x) { return x > 0 ? 1 : 0; }

    // Для выходного слоя используем линейную активацию (ничего)
    // или Tanh для ограничения [-1,1] – выберем Tanh для стабильности
    function tanh(x) { return Math.tanh(x); }
    function tanhDerivative(x) { const t = Math.tanh(x); return 1 - t * t; }

    // Прямой проход: X[768] -> выход в сантипешках
    function forward(input) {
        if (input.length !== INPUT_SIZE) throw new Error('Input size must be 768');

        // Слой 1: линейная комбинация + ReLU
        const z1 = new Array(HIDDEN1_SIZE);
        const a1 = new Array(HIDDEN1_SIZE);
        for (let j = 0; j < HIDDEN1_SIZE; j++) {
            let sum = b1[j];
            for (let i = 0; i < INPUT_SIZE; i++) {
                sum += input[i] * W1[i][j];
            }
            z1[j] = sum;
            a1[j] = relu(sum);
        }

        // Слой 2: линейная + ReLU
        const z2 = new Array(HIDDEN2_SIZE);
        const a2 = new Array(HIDDEN2_SIZE);
        for (let j = 0; j < HIDDEN2_SIZE; j++) {
            let sum = b2[j];
            for (let i = 0; i < HIDDEN1_SIZE; i++) {
                sum += a1[i] * W2[i][j];
            }
            z2[j] = sum;
            a2[j] = relu(sum);
        }

        // Выходной слой: линейная + Tanh (масштабируем потом в сантипешки)
        const z3 = new Array(OUTPUT_SIZE);
        const a3 = new Array(OUTPUT_SIZE);
        for (let j = 0; j < OUTPUT_SIZE; j++) {
            let sum = b3[j];
            for (let i = 0; i < HIDDEN2_SIZE; i++) {
                sum += a2[i] * W3[i][j];
            }
            z3[j] = sum;
            a3[j] = tanh(sum);   // Tanh, диапазон [-1, 1]
        }

        // Сохраняем кэш для backward
        cache = { input, z1, a1, z2, a2, z3, a3 };

        // Масштабируем до сантипешек: множитель 1000 (можно обучить)
        // Для обучения проще использовать a3 как есть, а преобразование делать снаружи
        return a3[0] * 1000;  // значение в сантипешках
    }

    // Обратное распространение ошибки, возвращает градиенты весов
    function backward(target) {
        if (!cache) throw new Error('No forward pass cached');
        const { input, z1, a1, z2, a2, z3, a3 } = cache;

        // Градиент функции потерь MSE = 0.5*(pred - target)^2, pred = a3[0]
        // dLoss/dPred = (pred - target) = delta_out_raw
        const pred = a3[0];
        const lossGradient = (pred - target);  // производная MSE без учёта Tanh

        // --- Выходной слой ---
        const dA3 = new Array(OUTPUT_SIZE);
        dA3[0] = lossGradient * tanhDerivative(z3[0]);  // цепочка через Tanh

        // Градиенты для W3, b3
        const dW3 = new Array(HIDDEN2_SIZE);
        for (let i = 0; i < HIDDEN2_SIZE; i++) {
            dW3[i] = new Array(OUTPUT_SIZE).fill(0);
            dW3[i][0] = dA3[0] * a2[i];
        }
        const db3 = [dA3[0]];

        // --- Скрытый слой 2 ---
        const dA2 = new Array(HIDDEN2_SIZE);
        for (let i = 0; i < HIDDEN2_SIZE; i++) {
            dA2[i] = dA3[0] * W3[i][0] * reluDerivative(z2[i]);
        }

        const dW2 = new Array(HIDDEN1_SIZE);
        for (let i = 0; i < HIDDEN1_SIZE; i++) {
            dW2[i] = new Array(HIDDEN2_SIZE);
            for (let j = 0; j < HIDDEN2_SIZE; j++) {
                dW2[i][j] = dA2[j] * a1[i];
            }
        }
        const db2 = dA2.slice();

        // --- Скрытый слой 1 ---
        const dA1 = new Array(HIDDEN1_SIZE);
        for (let i = 0; i < HIDDEN1_SIZE; i++) {
            let sum = 0;
            for (let j = 0; j < HIDDEN2_SIZE; j++) {
                sum += dA2[j] * W2[i][j];
            }
            dA1[i] = sum * reluDerivative(z1[i]);
        }

        const dW1 = new Array(INPUT_SIZE);
        for (let i = 0; i < INPUT_SIZE; i++) {
            dW1[i] = new Array(HIDDEN1_SIZE);
            for (let j = 0; j < HIDDEN1_SIZE; j++) {
                dW1[i][j] = dA1[j] * input[i];
            }
        }
        const db1 = dA1.slice();

        cache = null; // инвалидация кэша
        return { dW1, db1, dW2, db2, dW3, db3 };
    }

    // Обновление весов по градиентам (SGD + L2 регуляризация)
    function updateWeights(grads, lr = LEARNING_RATE) {
        // W1
        for (let i = 0; i < W1.length; i++) {
            for (let j = 0; j < W1[0].length; j++) {
                W1[i][j] -= lr * (grads.dW1[i][j] + L2_REG * W1[i][j]);
            }
        }
        for (let j = 0; j < b1.length; j++) {
            b1[j] -= lr * grads.db1[j];
        }
        // W2
        for (let i = 0; i < W2.length; i++) {
            for (let j = 0; j < W2[0].length; j++) {
                W2[i][j] -= lr * (grads.dW2[i][j] + L2_REG * W2[i][j]);
            }
        }
        for (let j = 0; j < b2.length; j++) {
            b2[j] -= lr * grads.db2[j];
        }
        // W3
        for (let i = 0; i < W3.length; i++) {
            for (let j = 0; j < W3[0].length; j++) {
                W3[i][j] -= lr * (grads.dW3[i][j] + L2_REG * W3[i][j]);
            }
        }
        for (let j = 0; j < b3.length; j++) {
            b3[j] -= lr * grads.db3[j];
        }
    }

    // Одна итерация обучения: forward + backward + update
    function train(input, target, lr = LEARNING_RATE) {
        forward(input); // создаёт cache
        const grads = backward(target);
        updateWeights(grads, lr);
    }

    // Пакетное обучение на массиве примеров [{input, target}]
    function trainBatch(examples, epochs = 1, lr = LEARNING_RATE) {
        for (let e = 0; e < epochs; e++) {
            // Перемешивание
            for (let i = examples.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [examples[i], examples[j]] = [examples[j], examples[i]];
            }
            for (let ex of examples) {
                train(ex.input, ex.target, lr);
            }
        }
    }

    // Сохранение весов в localStorage (Hogyoku Persistence)
    function saveWeights(key = 'nn_weights') {
        const data = {
            W1: W1,
            b1: b1,
            W2: W2,
            b2: b2,
            W3: W3,
            b3: b3
        };
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.warn('Failed to save NN weights:', e);
            return false;
        }
    }

    // Загрузка весов из localStorage
    function loadWeights(key = 'nn_weights') {
        const json = localStorage.getItem(key);
        if (!json) return false;
        try {
            const data = JSON.parse(json);
            if (data.W1 && data.b1 && data.W2 && data.b2 && data.W3 && data.b3) {
                W1 = data.W1; b1 = data.b1;
                W2 = data.W2; b2 = data.b2;
                W3 = data.W3; b3 = data.b3;
                return true;
            }
        } catch (e) {
            // повреждённые данные
        }
        return false;
    }

    // Экспорт весов для предобученной поставки
    function exportWeights() {
        return { W1, b1, W2, b2, W3, b3 };
    }

    // Импорт внешних весов (например, захардкоженных)
    function importWeights(data) {
        W1 = data.W1; b1 = data.b1;
        W2 = data.W2; b2 = data.b2;
        W3 = data.W3; b3 = data.b3;
    }

    // Инициализация при загрузке скрипта
    initialize();

    // Попытка загрузить сохранённые веса
    loadWeights();

    // Публичный API
    return {
        forward: forward,
        train: train,
        trainBatch: trainBatch,
        updateWeights: updateWeights,
        backward: backward,
        saveWeights: saveWeights,
        loadWeights: loadWeights,
        exportWeights: exportWeights,
        importWeights: importWeights,
        // Дополнительно
        getSizes: () => ({ INPUT_SIZE, HIDDEN1_SIZE, HIDDEN2_SIZE, OUTPUT_SIZE }),
        reset: initialize
    };
})();
