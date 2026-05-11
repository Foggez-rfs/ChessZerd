// Заглушка: полную книгу можно собрать из отдельных файлов
window.OpeningBookFull = {};
(function() {
  const sources = [window.OpeningDataA, window.OpeningDataB, window.OpeningDataC, window.OpeningDataD, window.OpeningDataE];
  for (let src of sources) {
    if (src) Object.assign(window.OpeningBookFull, src);
  }
  // Загружаем в существующий модуль opening_book.js
  if (window.OpeningBook && window.OpeningBook.load) {
    window.OpeningBook.load(window.OpeningBookFull);
  }
})();
