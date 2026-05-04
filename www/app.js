(function(){
'use strict';
var E=window.ChesszerdEngine;
var sel=-1,pc=0,ga=false,th='wood',stl='neo',ac=null;
var promoSquare=-1,promoMoves=[];

var AV=["👑","♛","🧠","♞","😈","♝"].map(function(e,i){
  return 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%23'+["e74c3c","3498db","2ecc71","f39c12","9b59b6","1abc9c"][i]+'"/%3E%3Ctext x="50" y="65" text-anchor="middle" fill="white" font-size="50"%3E'+e+'%3C/text%3E%3C/svg%3E';
});

var QT={ru:["Добро пожаловать в мою реальность.","Ты думаешь, что контролируешь доску?","Каждый твой ход ведёт к поражению.","Шахматы — отражение души.","Ты слаб.","Hogyoku эволюционирует.","Интересно... Ты сопротивляешься.","Твоя стратегия — пыль."]};

function rq(){return QT.ru[Math.floor(Math.random()*8)];}

function be(f,d){
  if(!d)d=0.1;if(!ac)return;
  try{var o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.value=f;g.gain.value=0.08;o.connect(g);g.connect(ac.destination);o.start();g.gain.exponentialRampToValueAtTime(0.001,ac.currentTime+d);setTimeout(function(){o.stop();},d*1000+50);}catch(e){}
}

function ps(p,c){
  var m={1:'♙',2:'♘',3:'♗',4:'♖',5:'♕',6:'♔'};
  return c===1?m[p].toLowerCase():m[p];
}

function rb(){
  var el=document.getElementById('chessboard');if(!el)return;el.innerHTML='';
  var b=E.board();
  for(var r=0;r<8;r++){
    for(var f=0;f<8;f++){
      var sq=r*8+f,p=b[sq],cell=document.createElement('div');
      cell.className='cell '+((r+f)%2===0?'light':'dark');
      cell.dataset.sq=sq;
      if(p!==0){
        var sp=document.createElement('span');sp.className='piece';
        sp.textContent=ps(p,E.pieceColorAt(sq));cell.appendChild(sp);
      }
      cell.addEventListener('click',function(s){return function(){cl(s);};}(sq));
      cell.addEventListener('touchstart',function(s){return function(e){e.preventDefault();cl(s);};}(sq));
      el.appendChild(cell);
    }
  }
  var qe=document.getElementById('aizen-quote');if(qe)qe.textContent=rq();
}

function cl(sq){
  if(!ga)return;
  // Если ждём выбор превращения
  if(promoSquare>=0){
    var pm=promoMoves.filter(function(m){return m.p===sq;});
    if(pm.length>0){
      E.makeMove(pm[0]);be(500,0.1);promoSquare=-1;promoMoves=[];sel=-1;rb();
      if(ga&&E.sideToMove()!==pc)setTimeout(ai,300);
      return;
    }
  }
  if(E.sideToMove()!==pc)return;
  if(sel===-1){
    if(E.board()[sq]!==0&&E.pieceColorAt(sq)===pc)sel=sq;
  }else{
    var ms=E.generateMoves(pc).filter(function(m){return m.f===sel&&m.t===sq;});
    if(ms.length>0){
      // Проверка на превращение
      if(ms.length>1&&ms[0].p!==undefined){
        promoSquare=sq;promoMoves=ms;showPromo(sq);
        return;
      }
      var cap=E.board()[sq]!==0||ms[0].ep;
      E.makeMove(ms[0]);be(cap?200:500,cap?0.2:0.1);sel=-1;rb();
      if(ga&&E.sideToMove()!==pc)setTimeout(ai,300);
    }else{
      if(E.board()[sq]!==0&&E.pieceColorAt(sq)===pc)sel=sq;else sel=-1;
    }
  }
}

function showPromo(sq){
  var el=document.getElementById('chessboard');if(!el)return;
  // Подсветим клетку
  var cells=el.querySelectorAll('.cell');
  for(var i=0;i<cells.length;i++){
    if(parseInt(cells[i].dataset.sq)===sq){
      cells[i].style.boxShadow='0 0 15px gold';break;
    }
  }
  // Простой диалог через alert заменим на выбор фигуры
  setTimeout(function(){
    var choice=prompt('Выбери фигуру: Ферзь(1), Ладья(2), Слон(3), Конь(4)','1');
    var p=[0,Q,R,B,H][parseInt(choice)||1];
    var pm=promoMoves.filter(function(m){return m.p===p;});
    if(pm.length>0){
      E.makeMove(pm[0]);be(500,0.1);
    }else{
      E.makeMove(promoMoves[0]);be(500,0.1);
    }
    promoSquare=-1;promoMoves=[];sel=-1;rb();
    if(ga&&E.sideToMove()!==pc)setTimeout(ai,300);
  },100);
}

function ai(){
  if(!ga)return;
  setTimeout(function(){
    var bm=E.searchBestMove(3);
    if(bm){
      var cap=E.board()[bm.t]!==0||bm.ep;
      E.makeMove(bm);be(cap?180:400,cap?0.2:0.1);rb();cg();
    }
  },200);
}

function cg(){
  if(E.generateMoves(E.sideToMove()).length===0){
    ga=false;be(300,0.5);
  }
}

function undo(){
  if(!ga||E.sideToMove()===pc)return;
  var h=E.gameHistory();if(!h.length)return;
  E.undoMove();if(h.length>1&&E.sideToMove()!==pc)E.undoMove();
  sel=-1;rb();
}

function getP(){var r=localStorage.getItem('cp');return r?JSON.parse(r):{n:'Игрок',a:0,el:1200,w:0,l:0};}
function saveP(p){localStorage.setItem('cp',JSON.stringify(p));}
function upP(){
  var p=getP();
  var ni=document.getElementById('username-input');if(ni)ni.value=p.n;
  var el=document.getElementById('elo');if(el)el.textContent=p.el;
  var wi=document.getElementById('wins');if(wi)wi.textContent=p.w;
  var lo=document.getElementById('losses');if(lo)lo.textContent=p.l;
  var gr=document.getElementById('profile-greeting');if(gr)gr.textContent=p.n;
  document.querySelectorAll('.avatar-img').forEach(function(im,i){im.classList.toggle('selected',i===p.a);});
}
function bAv(){
  var g=document.getElementById('avatar-chooser');if(!g)return;g.innerHTML='';
  AV.forEach(function(u,i){
    var d=document.createElement('div');d.className='avatar-img';d.style.backgroundImage='url('+u+')';
    d.addEventListener('click',function(){var p=getP();p.a=i;saveP(p);upP();});g.appendChild(d);
  });
}
window.saveProfile=function(){
  var ni=document.getElementById('username-input');if(!ni)return;
  var n=ni.value.trim();if(!n)return;var p=getP();p.n=n;saveP(p);upP();
};
function swT(id){
  document.querySelectorAll('.tab-content').forEach(function(e){e.style.display='none';});
  var t=document.getElementById(id);if(t)t.style.display='block';
  document.querySelectorAll('.tab-btn').forEach(function(b){
    var l=b.textContent.trim();
    b.classList.toggle('active',(id==='tab-game'&&l==='Игра')||(id==='tab-profile'&&l==='Профиль')||(id==='tab-settings'&&l==='Стиль'));
  });
  if(id==='tab-profile')upP();
}
function apTh(theme){
  var ts={wood:{l:'#f0d9b5',d:'#b58863',a:'#c8a96e'},classic:{l:'#f0f0f0',d:'#7d7d7d',a:'#3498db'},night:{l:'#4a4a4a',d:'#1e1e1e',a:'#9b59b6'},neon:{l:'#1a1a2e',d:'#0f0f23',a:'#00ffcc'}};
  var t=ts[theme]||ts.wood,rt=document.documentElement;
  rt.style.setProperty('--cell-light',t.l);rt.style.setProperty('--cell-dark',t.d);rt.style.setProperty('--accent',t.a);
  th=theme;rb();
}
function apSt(style){stl=style;rb();}
function bSt(){
  var ts=document.getElementById('theme-selector');if(ts){['wood','classic','night','neon'].forEach(function(t){var b=document.createElement('button');b.className='theme-btn';b.dataset.theme=t;b.textContent=t;b.addEventListener('click',function(){apTh(t);});ts.appendChild(b);});}
  var ss=document.getElementById('style-selector');if(ss){['neo','standard','minimal'].forEach(function(s){var b=document.createElement('button');b.className='theme-btn';b.dataset.style=s;b.textContent=s;b.addEventListener('click',function(){apSt(s);});ss.appendChild(b);});}
}
function init(){
  try{ac=new(window.AudioContext||window.webkitAudioContext)();}catch(e){}
  E.reset();pc=0;ga=true;sel=-1;promoSquare=-1;promoMoves=[];apTh('wood');apSt('neo');rb();swT('tab-game');bAv();bSt();upP();
  document.getElementById('btn-new-game').addEventListener('click',function(){E.reset();ga=true;sel=-1;promoSquare=-1;promoMoves=[];rb();});
}
window.ChesszerdApp={init:init,switchTab:swT,undoMove:undo,saveProfile:window.saveProfile};
document.addEventListener('DOMContentLoaded',init);
})();
