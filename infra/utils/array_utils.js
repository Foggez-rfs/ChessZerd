window.ArrayUtils = {
  shuffle(arr) { const a = [...arr]; for (let i = a.length-1; i>0; i--) { const j = Math.floor(Math.random()*(i+1)); [a[i],a[j]] = [a[j],a[i]]; } return a; },
  chunk(arr, size) { const r = []; for (let i=0; i<arr.length; i+=size) r.push(arr.slice(i,i+size)); return r; }
};
