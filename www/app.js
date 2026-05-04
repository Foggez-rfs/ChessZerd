(function(){
var E = window.ChesszerdEngine;
var sel = -1, pc = 0, ga = false, ac = null, highlights = [];
var currentTheme = 'wood';
var quotes = [
  "Добро пожаловать в мою реальность.",
  "Ты думаешь, что контролируешь доску?",
  "Каждый твой ход ведёт к поражению.",
  "Шахматы — отражение души.",
  "Ты слаб.",
  "Hogyoku эволюционирует.",
  "Интересно... Ты сопротивляешься.",
  "Твоя стратегия — пыль."
];

// Звуки
function be(f,d){
  if(!ac) return;
  try {
    var o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = f; g.gain.value = 0.06;
    o.connect(g); g.connect(ac.destination); o.start();
    g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + (d||0.1));
    setTimeout(function(){ o.stop(); }, (d||0.1)*1000+50);
  } catch(e) {}
}

// Символ фигуры
function sym(p, col){
  var map = {1:'♙',2:'♘',3:'♗',4:'♖',5:'♕',6:'♔'};
  var s = map[p] || '?';
  return col === 1 ? s.toLowerCase() : s;
}

// Подсветка
function clearHighlights(){
  var cells = document.querySelectorAll('.cell');
  for(var i=0; i<cells.length; i++) cells[i].classList.remove('valid-move','valid-capture');
  highlights = [];
}
function showHighlights(sq){
  clearHighlights();
  var ms = E.generateMoves(pc).filter(function(m){ return m.f === sq; });
  var cells = document.querySelectorAll('.cell');
  for(var i=0; i<ms.length; i++){
    var t = ms[i].to;
    for(var j=0; j<cells.length; j++){
      if(parseInt(cells[j].dataset.sq) === t){
        if(E.board()[t] !== 0 || ms[i].ep) cells[j].classList.add('valid-capture');
        else cells[j].classList.add('valid-move');
        highlights.push(t);
      }
    }
  }
}

// Отрисовка доски
function rb(){
  var el = document.getElementById('chessboard');
  if(!el) return;
  el.innerHTML = '';
  var b = E.board();
  for(var r=0; r<8; r++){
    for(var f=0; f<8; f++){
      var sq = r*8+f, p = b[sq];
      var cell = document.createElement('div');
      cell.className = 'cell ' + ((r+f)%2===0 ? 'light' : 'dark');
      cell.dataset.sq = sq;
      if(highlights.indexOf(sq) >= 0){
        cell.classList.add(E.board()[sq] !== 0 ? 'valid-capture' : 'valid-move');
      }
      if(p !== 0){
        var span = document.createElement('span');
        span.className = 'piece ' + (E.pieceColorAt(sq) === 0 ? 'white' : 'black');
        span.textContent = sym(p, E.pieceColorAt(sq));
        cell.appendChild(span);
      }
      (function(s){
        cell.addEventListener('click', function(){ cl(s); });
        cell.addEventListener('touchstart', function(e){ e.preventDefault(); cl(s); });
      })(sq);
      el.appendChild(cell);
    }
  }
  document.getElementById('aizen-quote').textContent = quotes[Math.floor(Math.random()*quotes.length)];
}

// Клик по клетке
function cl(sq){
  if(!ga || E.sideToMove() !== pc) return;
  if(sel === -1){
    if(E.board()[sq] !== 0 && E.pieceColorAt(sq) === pc){
      sel = sq; showHighlights(sq); rb();
    }
  } else {
    if(highlights.indexOf(sq) >= 0){
      var ms = E.generateMoves(pc).filter(function(m){ return m.f === sel && m.t === sq; });
      if(ms.length > 0){
        var mv = ms[0];
        if(mv.p){
          var choice = prompt('1-Ферзь 2-Ладья 3-Слон 4-Конь','1');
          var pp = [0,5,4,3,2][parseInt(choice)||1];
          for(var i=0; i<ms.length; i++){ if(ms[i].p === pp){ mv = ms[i]; break; } }
        }
        E.makeMove(mv); be(500,0.1); sel = -1; clearHighlights(); rb();
        if(ga && E.sideToMove() !== pc) setTimeout(ai, 300);
      }
    } else {
      clearHighlights();
      if(E.board()[sq] !== 0 && E.pieceColorAt(sq) === pc){
        sel = sq; showHighlights(sq); rb();
      } else { sel = -1; rb(); }
    }
  }
}

// Ход ИИ
function ai(){
  if(!ga) return;
  var bm = E.searchBestMove();
  if(bm){ E.makeMove(bm); be(400,0.1); clearHighlights(); rb(); }
}

// Отмена
function undo(){
  if(!ga || E.sideToMove() === pc) return;
  var h = E.gameHistory();
  if(!h.length) return;
  E.undoMove();
  if(h.length > 1 && E.sideToMove() !== pc) E.undoMove();
  sel = -1; clearHighlights(); rb();
}

// Профиль
function getP(){ var r = localStorage.getItem('cp'); return r ? JSON.parse(r) : {n:'Игрок',a:'',el:1200,w:0,l:0}; }
function saveP(p){ localStorage.setItem('cp', JSON.stringify(p)); }
function upP(){
  var p = getP();
  document.getElementById('username-input').value = p.n;
  document.getElementById('elo').textContent = p.el;
  document.getElementById('wins').textContent = p.w;
  document.getElementById('losses').textContent = p.l;
  document.getElementById('profile-greeting').textContent = p.n;
  var av = document.getElementById('avatar-preview');
  if(av) av.style.backgroundImage = p.a ? 'url('+p.a+')' : 'none';
}
window.saveProfile = function(){
  var input = document.getElementById('username-input');
  if(!input) return;
  var name = input.value.trim();
  if(!name) return;
  var p = getP(); p.n = name; saveP(p); upP();
};
function handleAvatarUpload(e){
  var file = e.target.files[0];
  if(!file) return;
  var reader = new FileReader();
  reader.onload = function(ev){
    var p = getP(); p.a = ev.target.result; saveP(p); upP();
  };
  reader.readAsDataURL(file);
}

// Вкладки
function swT(id){
  document.querySelectorAll('.tab-content').forEach(function(el){ el.style.display = 'none'; });
  document.getElementById(id).style.display = 'block';
  document.querySelectorAll('.tab-btn').forEach(function(btn){
    btn.classList.remove('active');
    if((id==='tab-game' && btn.textContent==='Игра') ||
       (id==='tab-profile' && btn.textContent==='Профиль') ||
       (id==='tab-settings' && btn.textContent==='Стиль')) btn.classList.add('active');
  });
  if(id==='tab-profile') upP();
}

// Стили
function applyTheme(theme){
  var themes = {
    wood:   {light:'#f0d9b5',dark:'#b58863',accent:'#c8a96e'},
    classic:{light:'#f0f0f0',dark:'#7d7d7d',accent:'#3498db'},
    night:  {light:'#4a4a4a',dark:'#1e1e1e',accent:'#9b59b6'},
    neon:   {light:'#1a1a2e',dark:'#0f0f23',accent:'#00ffcc'}
  };
  var t = themes[theme] || themes.wood;
  var root = document.documentElement;
  root.style.setProperty('--cell-light', t.light);
  root.style.setProperty('--cell-dark', t.dark);
  root.style.setProperty('--accent', t.accent);
  currentTheme = theme;
  rb();
}
function buildSettings(){
  var ts = document.getElementById('theme-selector');
  if(ts){
    ['wood','classic','night','neon'].forEach(function(t){
      var btn = document.createElement('button');
      btn.className = 'theme-btn'; btn.dataset.theme = t; btn.textContent = t;
      btn.addEventListener('click', function(){ applyTheme(t); });
      ts.appendChild(btn);
    });
  }
}

// Инициализация
function init(){
  try { ac = new (window.AudioContext||window.webkitAudioContext)(); } catch(e) {}
  E.reset(); pc = 0; ga = true; sel = -1; clearHighlights();
  applyTheme('wood');
  rb(); swT('tab-game');
  buildSettings();
  upP();
  document.getElementById('btn-new-game').addEventListener('click', function(){
    E.reset(); ga = true; sel = -1; clearHighlights(); rb();
  });
  document.getElementById('avatar-upload')?.addEventListener('change', handleAvatarUpload);
}

window.ChesszerdApp = { init:init, switchTab:swT, undoMove:undo, saveProfile:window.saveProfile };
document.addEventListener('DOMContentLoaded', init);
})();
