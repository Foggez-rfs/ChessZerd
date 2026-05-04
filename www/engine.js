(function(){
'use strict';
const N=0,P=1,H=2,B=3,R=4,Q=5,K=6,W=0,Bk=1;
let br=new Array(64).fill(N),cr=new Array(64).fill(W);
let st=W,cas=15,ep=-1,hm=0,fm=1,hist=[];
function on(s){return s>=0&&s<64;}
function fl(s){return s&7;}
function rk(s){return s>>3;}

function gen(col){
  let m=[],op=1-col,pd=col===W?-8:8,sr=col===W?6:1,pr=col===W?0:7;
  for(let s=0;s<64;s++){
    if(br[s]===N||cr[s]!==col)continue;
    let p=br[s];
    if(p===P){
      let fw=s+pd;
      if(on(fw)&&br[fw]===N){
        if(rk(fw)===pr)for(let x of[Q,R,B,H])m.push({f:s,t:fw,pr:x});
        else{m.push({f:s,t:fw});let db=s+2*pd;if(rk(s)===sr&&on(db)&&br[db]===N)m.push({f:s,t:db});}
      }
      for(let d of[pd-1,pd+1]){
        let cs=s+d;if(!on(cs))continue;
        if((br[cs]!==N&&cr[cs]===op)||cs===ep){
          if(rk(cs)===pr)for(let x of[Q,R,B,H])m.push({f:s,t:cs,pr:x,ep:cs===ep});
          else m.push({f:s,t:cs,ep:cs===ep});
        }
      }
    }else if(p===H){
      for(let d of[-17,-15,-10,-6,6,10,15,17]){
        let t=s+d;if(!on(t))continue;
        if(Math.abs(fl(t)-fl(s))<=2&&(br[t]===N||cr[t]===op))m.push({f:s,t});
      }
    }else if(p===B||p===R||p===Q){
      let dirs=p===B?[-9,-7,7,9]:p===R?[-8,8,-1,1]:[-9,-8,-7,-1,1,7,8,9];
      for(let d of dirs){
        let t=s+d;
        while(on(t)){
          if(p!==R&&Math.abs(fl(t)-fl(t-d))>1)break;
          if(br[t]===N){m.push({f:s,t});}
          else{if(cr[t]===op)m.push({f:s,t});break;}
          t+=d;
        }
      }
    }else if(p===K){
      for(let d of[-9,-8,-7,-1,1,7,8,9]){
        let t=s+d;if(!on(t))continue;
        if(Math.abs(fl(t)-fl(s))<=1&&(br[t]===N||cr[t]===op))m.push({f:s,t});
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
  if(mv.pr)br[mv.t]=mv.pr;
  if(mv.ep){let cp=mv.t+(st===W?8:-8);br[cp]=N;}
  if(mv.cs){
    if(mv.t===62){br[61]=R;cr[61]=W;br[63]=N;}
    else if(mv.t===58){br[59]=R;cr[59]=W;br[56]=N;}
    else if(mv.t===6){br[5]=R;cr[5]=Bk;br[7]=N;}
    else if(mv.t===2){br[3]=R;cr[3]=Bk;br[0]=N;}
  }
  ep=-1;
  if(br[mv.t]===P&&Math.abs(rk(mv.t)-rk(mv.f))===2)ep=mv.t+(st===W?8:-8);
  hm=(br[mv.t]===P||mv.cap!==N)?0:hm+1;
  st=1-st;if(st===W)fm++;hist.push(mv);
}

function unm(){
  if(!hist.length)return;
  let mv=hist.pop();
  br[mv.f]=br[mv.t];cr[mv.f]=cr[mv.t];br[mv.t]=mv.cap||N;
  if(mv.cap)cr[mv.t]=1-st;
  if(mv.pr)br[mv.t]=P;
  if(mv.ep){let cp=mv.t+(st===W?8:-8);br[cp]=P;cr[cp]=1-st;}
  if(mv.cs){
    if(mv.t===62){br[63]=R;cr[63]=W;br[61]=N;}
    else if(mv.t===58){br[56]=R;cr[56]=W;br[59]=N;}
    else if(mv.t===6){br[7]=R;cr[7]=Bk;br[5]=N;}
    else if(mv.t===2){br[0]=R;cr[0]=Bk;br[3]=N;}
  }
  cas=mv.pcas;ep=mv.pep;hm=mv.phm;st=1-st;if(st===W)fm--;
}

function ev(){
  let val={1:100,2:320,3:330,4:500,5:900,6:20000},sc=0;
  for(let i=0;i<64;i++)if(br[i]!==N)sc+=(cr[i]===W?1:-1)*val[br[i]];
  return st===W?sc:-sc;
}

function minmax(d,al,bt){
  if(d===0)return ev();
  let ms=gen(st);
  if(ms.length===0)return -99999;
  for(let m of ms){
    move(m);
    let sc=-minmax(d-1,-bt,-al);
    unm();
    if(sc>=bt)return bt;
    if(sc>al)al=sc;
  }
  return al;
}

function best(d=4){
  let ms=gen(st);
  if(!ms.length)return null;
  let bm=ms[0],bs=-Infinity;
  for(let m of ms){
    move(m);
    let sc=-minmax(d-1,-Infinity,-bs);
    unm();
    if(sc>bs){bs=sc;bm=m;}
  }
  return bm;
}

window.ChesszerdEngine={
  board:()=>br,pieceColorAt:(s)=>cr[s],sideToMove:()=>st,
  generateMoves:gen,makeMove:move,undoMove:unm,searchBestMove:best,
  gameHistory:()=>hist,
  reset:()=>{
    br=new Array(64).fill(N);cr=new Array(64).fill(W);
    for(let i=8;i<16;i++){br[i]=P;cr[i]=Bk;}
    for(let i=48;i<56;i++){br[i]=P;cr[i]=W;}
    br[0]=R;cr[0]=Bk;br[1]=H;cr[1]=Bk;br[2]=B;cr[2]=Bk;br[3]=Q;cr[3]=Bk;br[4]=K;cr[4]=Bk;br[5]=B;cr[5]=Bk;br[6]=H;cr[6]=Bk;br[7]=R;cr[7]=Bk;
    br[56]=R;cr[56]=W;br[57]=H;cr[57]=W;br[58]=B;cr[58]=W;br[59]=Q;cr[59]=W;br[60]=K;cr[60]=W;br[61]=B;cr[61]=W;br[62]=H;cr[62]=W;br[63]=R;cr[63]=W;
    st=W;cas=15;ep=-1;hm=0;fm=1;hist=[];
  },
  onPlayerWin:()=>{}
};
ChesszerdEngine.reset();
})();
