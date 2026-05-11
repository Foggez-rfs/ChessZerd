window.BitUtils = (function() {
  function popcount(x) { let c=0; while(x){ c+=x&1; x>>>=1; } return c; }
  function bitscan(x) { if(x===0) return -1; let i=0; while((x&1)===0){ x>>>=1; i++; } return i; }
  return { popcount, bitscan };
})();
