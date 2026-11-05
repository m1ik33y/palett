/* Canvas state, helpers and shape geometry */
const $=s=>document.querySelector(s);
const stage=$('#stage'),sc=stage.getContext('2d');
let car=null,cur=null,loading=0,last='',qt,fitMode=1;let W=1920,H=1080,H0=1080,Q=1,SCR=0;
const art=document.createElement('canvas'),base=document.createElement('canvas'),lay=document.createElement('canvas');
const ac=art.getContext('2d'),bc=base.getContext('2d'),lc=lay.getContext('2d');let dirty=1,rq=0;
function setCanvas(w,h,scr){W=w;H=H0=h;SCR=scr?1:0;
 if(SCR){Q=1;art.width=art.height=base.width=base.height=1}
 else{Q=Math.max(.3,Math.min(3,devicePixelRatio||1,Math.sqrt(8e6/(W*H))));art.width=art.height=base.width=base.height=1}
 dirty=1}
setCanvas(1920,1080,0);
const frm=document.createElement('canvas'),fc=frm.getContext('2d');let cs='';
const req=()=>{if(!rq){rq=1;requestAnimationFrame(()=>{rq=0;render(1)})}};
let objs=[],sel=null,tool='brush',view={s:1,x:0,y:0},hist=[],redo=[],imgs={},nid=1,bg='#ffffff',drag=null,spc=0,live=null,pend=0;
const st={color:'#111111',fill:'#ffcc00',size:8,op:1,brush:'pen',font:'Arial',bold:false,italic:false,doFill:false,shape:'rect'};
const rnd=n=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)};
const mk=o=>Object.assign({op:st.op,c:st.color,fc:st.fill,df:st.doFill,s:st.size,hide:0},o);
const snap=()=>{hist.push(JSON.stringify(objs));if(hist.length>80)hist.shift();redo=[]};
const fontStr=(o,k=1)=>`${o.i?'italic ':''}${o.b?'bold ':''}${o.fs*k}px "${o.f}",sans-serif`;
function fit(o){ac.font=fontStr(o);const ls=o.l.split('\n');o.w=Math.max(10,...ls.map(l=>ac.measureText(l).width));o.h=ls.length*o.fs*1.2}
function bb(raw,br){let a=1e9,b=1e9,c=-1e9,d=-1e9;raw.forEach(p=>{a=Math.min(a,p[0]);b=Math.min(b,p[1]);c=Math.max(c,p[0]);d=Math.max(d,p[1])});
 const w=Math.max(c-a,1),h=Math.max(d-b,1);return mk({t:'stroke',br,x:a,y:b,w,h,pts:raw.map(p=>[(p[0]-a)/w,(p[1]-b)/h])})}
const rs=(P,st)=>{const R=[P[0]];let acc=0;for(let i=1;i<P.length;i++){let x0=P[i-1][0],y0=P[i-1][1];const x1=P[i][0],y1=P[i][1];let d=Math.hypot(x1-x0,y1-y0);while(acc+d>=st&&d>0){const t=(st-acc)/d;x0+=(x1-x0)*t;y0+=(y1-y0)*t;R.push([x0,y0]);d=Math.hypot(x1-x0,y1-y0);acc=0}acc+=d}return R};
const ngon=(n,r0=-Math.PI/2)=>Array.from({length:n},(_,i)=>[.5+.5*Math.cos(r0+i*6.2832/n),.5+.5*Math.sin(r0+i*6.2832/n)]);
const stp=(n,k)=>Array.from({length:n*2},(_,i)=>{const a=-Math.PI/2+i*Math.PI/n,R=i%2?.5*k:.5;return[.5+R*Math.cos(a),.5+R*Math.sin(a)]});
const PTS={tri:[[.5,0],[1,1],[0,1]],rtri:[[0,0],[1,1],[0,1]],dia:[[.5,0],[1,.5],[.5,1],[0,.5]],pent:ngon(5),hex:ngon(6,0),oct:ngon(8,-Math.PI/8),star:stp(5,.4),star6:stp(12,.7),
 arrow:[[0,.35],[.6,.35],[.6,.08],[1,.5],[.6,.92],[.6,.65],[0,.65]],chev:[[0,0],[.6,0],[1,.5],[.6,1],[0,1],[.4,.5]],
 plus:[[.35,0],[.65,0],[.65,.35],[1,.35],[1,.65],[.65,.65],[.65,1],[.35,1],[.35,.65],[0,.65],[0,.35],[.35,.35]],
 para:[[.25,0],[1,0],[.75,1],[0,1]],trap:[[.2,0],[.8,0],[1,1],[0,1]],bubble:[[0,0],[1,0],[1,.75],[.45,.75],[.2,1],[.25,.75],[0,.75]],bolt:[[.6,0],[.15,.55],[.45,.55],[.35,1],[.85,.4],[.55,.4]]};
