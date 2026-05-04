(function(){
var N=0,P=1,H=2,B=3,R=4,Q=5,K=6,W=0,Bk=1;
var br,cr,st,cas,ep,hm,fm,hist;

function start(){
  br=new Array(64);cr=new Array(64);
  var init = [
    R,H,B,Q,K,B,H,R,
    P,P,P,P,P,P,P,P,
    N,N,N,N,N,N,N,N,
    N,N,N,N,N,N,N,N,
    N,N,N,N,N,N,N,N,
    N,N,N,N,N,N,N,N,
    P,P,P,P,P,P,P,P,
    R,H,B,Q,K,B,H,R
  ];
  var icol = [
    Bk,Bk,Bk,Bk,Bk,Bk,Bk,Bk,
    Bk,Bk,Bk,Bk,Bk,Bk,Bk,Bk,
    W,W,W,W,W,W,W,W,
    W,W,W,W,W,W,W,W,
    W,W,W,W,W,W,W,W,
    W,W,W,W,W,W,W,W,
    W,W,W,W,W,W,W,W,
    W,W,W,W,W,W,W,W
  ];
  for(var i=0;i<64;i++){br[i]=init[i];cr[i]=icol[i];}
  st=W;cas=15;ep=-1;hm=0;fm=1;hist=[];
}

function on(s){return s>=0&&s<64;}
function fl(s){return s&7;}
function rk(s){return s>>3;}

function gen(col){
  var m=[],op=1-col,pd=col===W?-8:8,sr=col===W?6:1,pr=col===W?0:7;
  for(var s=0;s<64;s++){
    if(br[s]===N||cr[s]!==col)continue;
    var p=br[s];
    if(p===P){
      var fw=s+pd;
      if(on(fw)&&br[fw]===N){
        if(rk(fw)===pr){
          m.push({f:s,t:fw,p:Q});m.push({f:s,t:fw,p:R});m.push({f:s,t:fw,p:B});m.push({f:s,t:fw,p:H});
        }else{
          m.push({f:s,t:fw});
          var db=s+2*pd;
          if(rk(s)===sr&&on(db)&&br[db]===N)m.push({f:s,t:db});
        }
      }
      var caps=[pd-1,pd+1];
      for(var ci=0;ci<2;ci++){
        var cs=s+caps[ci];if(!on(cs))continue;
        if(fl(cs)===fl(s)-1||fl(cs)===fl(s)+1){
          if((br[cs]!==N&&cr[cs]===op)||cs===ep){
            if(rk(cs)===pr){
              m.push({f:s,t:cs,p:Q,ep:cs===ep});m.push({f:s,t:cs,p:R,ep:cs===ep});
              m.push({f:s,t:cs,p:B,ep:cs===ep});m.push({f:s,t:cs,p:H,ep:cs===ep});
            }else{m.push({f:s,t:cs,ep:cs===ep});}
          }
        }
      }
    }else if(p===H){
      var ko=[-17,-15,-10,-6,6,10,15,17];
      for(var ki=0;ki<8;ki++){
        var t=s+ko[ki];if(!on(t))continue;
        if(Math.abs(fl(t)-fl(s))<=2&&(br[t]===N||cr[t]===op))m.push({f:s,t:t});
      }
    }else if(p===B||p===R||p===Q){
      var dirs=p===B?[-9,-7,7,9]:p===R?[-8,8,-1,1]:[-9,-8,-7,-1,1,7,8,9];
      for(var di=0;di<dirs.length;di++){
        var d=dirs[di],t=s+d;
        while(on(t)){
          if(p!==R&&Math.abs(fl(t)-fl(t-d))>1)break;
          if(br[t]===N)m.push({f:s,t:t});
          else{if(cr[t]===op)m.push({f:s,t:t});break;}
          t+=d;
        }
      }
    }else if(p===K){
      var kd=[-9,-8,-7,-1,1,7,8,9];
      for(var i=0;i<8;i++){
        var t=s+kd[i];if(!on(t))continue;
        if(Math.abs(fl(t)-fl(s))<=1&&(br[t]===N||cr[t]===op))m.push({f:s,t:t});
      }
      if(col===W&&s===60&&(cas&1)&&br[61]===N&&br[62]===N)m.push({f:60,t:62,cs:true});
      if(col===W&&s===60&&(cas&2)&&br[59]===N&&br[58]===N&&br[57]===N)m.push({f:60,t:58,cs:true});
      if(col===Bk&&s===4&&(cas&4)&&br[5]===N&&br[6]===N)m.push({f:4,t:6,cs:true});
      if(col===Bk&&s===4&&(cas&8)&&br[3]===N&&br[2]===N&&br[1]===N)m.push({f:4,t:2,cs:true});
    }
  }
  return m;
}

function move(mv){
  mv.pcas=cas;mv.pep=ep;mv.phm=hm;mv.cap=br[mv.t];
  br[mv.t]=br[mv.f];cr[mv.t]=cr[mv.f];br[mv.f]=N;
  if(mv.p)br[mv.t]=mv.p;
  if(mv.ep){var cp=mv.t+(st===W?8:-8);br[cp]=N;}
  if(mv.cs){
    if(mv.t===62){br[61]=R;cr[61]=W;br[63]=N;}
    else if(mv.t===58){br[59]=R;cr[59]=W;br[56]=N;}
    else if(mv.t===6){br[5]=R;cr[5]=Bk;br[7]=N;}
    else if(mv.t===2){br[3]=R;cr[3]=Bk;br[0]=N;}
  }
  ep=-1;
  if(!mv.p&&br[mv.t]===P&&Math.abs(rk(mv.t)-rk(mv.f))===2)ep=mv.t+(st===W?8:-8);
  hm=(br[mv.t]===P||mv.cap!==N)?0:hm+1;
  st=1-st;if(st===W)fm++;hist.push(mv);
}

function unm(){
  if(!hist.length)return;
  var mv=hist.pop();
  br[mv.f]=br[mv.t];cr[mv.f]=cr[mv.t];br[mv.t]=mv.cap||N;
  if(mv.cap)cr[mv.t]=1-st;
  if(mv.ep){var cp=mv.t+(st===W?8:-8);br[cp]=P;cr[cp]=1-st;}
  if(mv.cs){
    if(mv.t===62){br[63]=R;cr[63]=W;br[61]=N;}
    else if(mv.t===58){br[56]=R;cr[56]=W;br[59]=N;}
    else if(mv.t===6){br[7]=R;cr[7]=Bk;br[5]=N;}
    else if(mv.t===2){br[0]=R;cr[0]=Bk;br[3]=N;}
  }
  cas=mv.pcas;ep=mv.pep;hm=mv.phm;st=1-st;if(st===W)fm--;
}

function ev(){
  var val={1:100,2:320,3:330,4:500,5:900,6:20000},s=0;
  for(var i=0;i<64;i++)if(br[i]!==N)s+=(cr[i]===W?1:-1)*val[br[i]];
  return st===W?s:-s;
}

function minmax(d,a,bt){
  if(d<=0)return ev();
  var ms=gen(st);
  if(!ms.length)return -99999;
  for(var i=0;i<ms.length;i++){
    move(ms[i]);var sc=-minmax(d-1,-bt,-a);unm();
    if(sc>=bt)return bt;
    if(sc>a)a=sc;
  }
  return a;
}

function best(){
  var ms=gen(st);if(!ms.length)return null;
  var bm=ms[0],bs=-Infinity;
  for(var i=0;i<ms.length;i++){
    move(ms[i]);var sc=-minmax(3,-Infinity,-bs);unm();
    if(sc>bs){bs=sc;bm=ms[i];}
  }
  return bm;
}

start();

window.ChesszerdEngine={
  board:function(){return br;},
  pieceColorAt:function(sq){return cr[sq];},
  sideToMove:function(){return st;},
  generateMoves:gen,
  makeMove:move,
  undoMove:unm,
  searchBestMove:best,
  gameHistory:function(){return hist;},
  reset:start,
  onPlayerWin:function(){}
};
})();
