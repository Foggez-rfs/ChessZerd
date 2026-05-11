window.RingBuffer = (function() {
  function create(size) { return { buffer: new Array(size), head: 0, tail: 0, size }; }
  function push(rb, item) { rb.buffer[rb.tail] = item; rb.tail = (rb.tail+1) % rb.size; if (rb.tail === rb.head) rb.head = (rb.head+1) % rb.size; }
  function pop(rb) { if (rb.head === rb.tail) return null; const item = rb.buffer[rb.head]; rb.head = (rb.head+1) % rb.size; return item; }
  return { create, push, pop };
})();
