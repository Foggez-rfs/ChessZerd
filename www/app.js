(function(){
var E=window.ChesszerdEngine;
var sel=-1,pc=0,ga=false,highlights=[];
var quotes=["Добро пожаловать.","Ты думаешь, что контролируешь доску?","Каждый твой ход ведёт к поражению.","Шахматы — отражение души.","Ты слаб.","Hogyoku эволюционирует.","Интересно... Ты сопротивляешься.","Твоя стратегия — пыль."];

function rq(){return quotes[Math.floor(Math.random()*quotes.length)];}

function sym(p,c){
  var m={1:'♙',2:'♘',3:'♗',4:'♖',5:'♕',6:'♔'};
  var s=m[p]||'?';
  return c===1?s.toLowerCase():s;
}

function clearHighlights(){
  var cells=document.querySelectorAll('.cell');
  for(var i=0;i<cells.length;i++){
    cells[i].classList.remove('valid-move','valid-capture');
    cells[i].style.background='';
  }
  highlights=[];
}

function showHighlights(sq){
  clearHighlights();
  var ms=E.generateMoves(pc).filter(function(m){return m.f===sq;});
  var cells=document.querySelectorAll('.cell');
  for(var i=0;i<ms.length;i++){
    var t=ms[i].to;
    for(var j=0;j<cells.length;j++){
      if(parseInt(cells[j].dataset.sq)===t){
        if(E.board()[t]!==0||ms[i].ep){
          cells[j].classList.add('valid-capture');
        }else{
          cells[j].classList.add('valid-move');
        }
        highlights.push(t);
        break;
      }
    }
  }
}

function rb(){
  var el=document.getElementById('chessboard');if(!el)return;
  el.innerHTML='';var b=E.board();
  for(var r=0;r<8;r++){
    for(var f=0;f<8;f++){
      var sq=r*8+f,p=b[sq];
      var cell=document.createElement('div');
      cell.className='cell '+((r+f)%2===0?'light':'dark');
      cell.dataset.sq=sq;
      if(highlights.indexOf(sq)>=0){
        if(E.board()[sq]!==0||E.generateMoves(pc).some(function(m){return m.f===sel&&m.to===sq&&(E.board()[sq]!==0||m.ep);})){
          cell.classList.add('valid-capture');
        }else{
          cell.classList.add('valid-move');
        }
      }
      cell.textContent=p!==0?sym(p,E.pieceColorAt(sq)):'';
      (function(s){
        cell.addEventListener('click',function(){cl(s);});
      })(sq);
      el.appendChild(cell);
    }
  }
  document.getElementById('aizen-quote').textContent=rq();
}

function cl(sq){
  if(!ga||E.sideToMove()!==pc)return;
  if(sel===-1){
    if(E.board()[sq]!==0&&E.pieceColorAt(sq)===pc){
      sel=sq;showHighlights(sq);rb();
    }
  }else{
    if(highlights.indexOf(sq)>=0){
      var ms=E.generateMoves(pc).filter(function(m){return m.f===sel&&m.to===sq;});
      if(ms.length>0){
        var mv=ms[0];
        if(mv.p){
          var choice=prompt('1-Ферзь 2-Ладья 3-Слон 4-Конь','1');
          var pp=[0,5,4,3,2][parseInt(choice)||1];
          for(var i=0;i<ms.length;i++){if(ms[i].p===pp){mv=ms[i];break;}}
        }
        try{
          E.makeMove(mv);
          sel=-1;clearHighlights();rb();
          if(ga&&E.sideToMove()!==pc)setTimeout(ai,300);
        }catch(e){alert('Ошибка хода: '+e);}
      }
    }else{
      clearHighlights();
      if(E.board()[sq]!==0&&E.pieceColorAt(sq)===pc){sel=sq;showHighlights(sq);rb();}
      else{sel=-1;rb();}
    }
  }
}

function ai(){
  if(!ga)return;
  try{
    var bm=E.searchBestMove();
    if(bm){E.makeMove(bm);clearHighlights();rb();}
  }catch(e){alert('Ошибка ИИ: '+e);}
}

function undo(){
  if(!ga||E.sideToMove()===pc)return;
  var h=E.gameHistory();if(!h.length)return;
  try{
    E.undoMove();if(h.length>1&&E.sideToMove()!==pc)E.undoMove();
    sel=-1;clearHighlights();rb();
  }catch(e){alert('Ошибка отмены: '+e);}
}

function swT(id){
  document.querySelectorAll('.tab-content').forEach(function(e){e.style.display='none';});
  document.getElementById(id).style.display='block';
}

function init(){
  E.reset();pc=0;ga=true;sel=-1;clearHighlights();rb();swT('tab-game');
  document.getElementById('btn-new-game').addEventListener('click',function(){
    E.reset();ga=true;sel=-1;clearHighlights();rb();
  });
}

window.ChesszerdApp={init:init,switchTab:swT,undoMove:undo};
document.addEventListener('DOMContentLoaded',init);
})();
