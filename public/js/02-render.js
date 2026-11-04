/* Drawing of strokes/shapes/text and the render loop */
function shapePath(c,k,x,y,w,h){
 if(k=='rrect'){c.roundRect?c.roundRect(x,y,w,h,Math.min(w,h)*.22):c.rect(x,y,w,h);return}
 if(k=='heart'){c.moveTo(x+w*.5,y+h*.95);c.bezierCurveTo(x-w*.1,y+h*.55,x+w*.1,y-h*.05,x+w*.5,y+h*.28);c.bezierCurveTo(x+w*.9,y-h*.05,x+w*1.1,y+h*.55,x+w*.5,y+h*.95);c.closePath();return}
 (PTS[k]||PTS.tri).forEach((q,i)=>i?c.lineTo(x+q[0]*w,y+q[1]*h):c.moveTo(x+q[0]*w,y+q[1]*h));c.closePath()}
function draw(c,o){
 if(o.hide||o.ed)return;c.save();c.globalAlpha=o.op;
 if(o.t=='img')c.drawImage(imgs[o.img],o.x,o.y,o.w,o.h);
 else if(o.t=='text'){c.font=fontStr(o);c.fillStyle=o.c;c.textBaseline='top';o.l.split('\n').forEach((l,i)=>c.fillText(l,o.x,o.y+i*o.fs*1.2))}
 else if(o.t=='rect'||o.t=='ell'||o.t=='poly'){c.lineWidth=o.s;c.strokeStyle=o.c;c.fillStyle=o.fc;c.lineJoin='round';c.beginPath();
  o.t=='rect'?c.rect(o.x,o.y,o.w,o.h):o.t=='poly'?shapePath(c,o.k,o.x,o.y,o.w,o.h):c.ellipse(o.x+o.w/2,o.y+o.h/2,o.w/2,o.h/2,0,0,7);if(o.df)c.fill();if(o.s>0)c.stroke()}
 else{
  const P=o.pts.map(p=>[o.x+p[0]*o.w,o.y+p[1]*o.h]);c.lineCap=c.lineJoin='round';c.strokeStyle=c.fillStyle=o.c;c.lineWidth=o.s;
  const path=()=>{c.beginPath();c.moveTo(P[0][0],P[0][1]);if(P.length==1)c.lineTo(P[0][0]+.01,P[0][1]);
   for(let i=1;i<P.length-1;i++)c.quadraticCurveTo(P[i][0],P[i][1],(P[i][0]+P[i+1][0])/2,(P[i][1]+P[i+1][1])/2);
   if(P.length>1)c.lineTo(P[P.length-1][0],P[P.length-1][1])};
  switch(o.br){
   case 'eraser':c.globalCompositeOperation='destination-out';c.globalAlpha=1;c.lineWidth=o.s*2;path();c.stroke();break;
   case 'marker':c.globalAlpha*=.6;path();c.stroke();break;
   case 'hl':c.globalAlpha*=.35;c.lineCap='butt';c.lineWidth=o.s*2.5;path();c.stroke();break;
   case 'neon':c.shadowColor=o.c;c.shadowBlur=o.s*2.5;path();c.stroke();c.shadowBlur=0;c.strokeStyle='#fff';c.lineWidth=Math.max(1,o.s/3);path();c.stroke();break;
   case 'dash':c.setLineDash([o.s*1.5,o.s*1.8]);path();c.stroke();break;
   case 'spray':P.forEach((p,i)=>{for(let k=0;k<8;k++){const r=rnd(i*13+k)*o.s*2,a=rnd(i*7+k+99)*6.283;c.fillRect(p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r,1.6,1.6)}});break;
   case 'ball':c.lineWidth=Math.max(1,o.s*.45);path();c.stroke();break;
   case 'dip':for(let i=1;i<P.length;i++){const a=Math.atan2(P[i][1]-P[i-1][1],P[i][0]-P[i-1][0]);c.lineWidth=Math.max(.8,o.s*(.2+.8*Math.abs(Math.sin(a-.8))));c.beginPath();c.moveTo(P[i-1][0],P[i-1][1]);c.lineTo(P[i][0],P[i][1]);c.stroke()}break;
   case 'ink':for(let i=1;i<P.length;i++){c.lineWidth=Math.max(.8,o.s*(.2+1.1*Math.sin(Math.PI*i/P.length)));c.beginPath();c.moveTo(P[i-1][0],P[i-1][1]);c.lineTo(P[i][0],P[i][1]);c.stroke()}break;
   case 'pencil':c.globalAlpha*=.55;c.lineWidth=Math.max(1,o.s*.5);for(let k=0;k<3;k++){c.save();c.translate((rnd(k+3)-.5)*o.s*.4,(rnd(k+9)-.5)*o.s*.4);path();c.stroke();c.restore()}break;
   case 'charcoal':{c.globalAlpha*=.3;for(let k=0;k<4;k++){c.save();c.translate((rnd(k+5)-.5)*o.s*.5,(rnd(k+17)-.5)*o.s*.5);c.lineWidth=o.s*(.7+rnd(k)*.5);path();c.stroke();c.restore()}
    c.globalAlpha=o.op*.7;rs(P,Math.max(1.5,o.s*.3)).forEach((p,i)=>{for(let k=0;k<3;k++){const r=rnd(i*5+k)*o.s*.9,a=rnd(i*3+k+7)*6.283;c.fillRect(p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r,1.5,1.5)}});break}
   case 'crayon':rs(P,Math.max(1,o.s*.25)).forEach((p,i)=>{for(let k=0;k<7;k++){const r=Math.sqrt(rnd(i*11+k))*o.s*.6,a=rnd(i*7+k+31)*6.283;c.globalAlpha=o.op*(.45+rnd(i+k)*.4);c.fillRect(p[0]+Math.cos(a)*r,p[1]+Math.sin(a)*r,2,2)}});break;
   case 'air':{const R=o.s*1.6;rs(P,Math.max(2,o.s*.3)).forEach(p=>{const g=c.createRadialGradient(p[0],p[1],0,p[0],p[1],R);g.addColorStop(0,o.c);g.addColorStop(1,o.c+'00');c.globalAlpha=o.op*.12;c.fillStyle=g;c.fillRect(p[0]-R,p[1]-R,R*2,R*2)});break}
   case 'water':c.globalAlpha*=.14;for(let k=0;k<4;k++){c.save();c.translate((rnd(k+2)-.5)*o.s*.5,(rnd(k+8)-.5)*o.s*.5);c.lineWidth=o.s*(2.4-k*.45);path();c.stroke();c.restore()}break;
   case 'oil':c.lineCap='butt';for(let k=-2;k<=2;k++){c.save();c.translate(k*o.s*.2,k*o.s*.12);c.lineWidth=o.s*.3;c.globalAlpha=o.op*(.7+rnd(k+9)*.3);path();c.stroke();c.restore()}break;
   case 'dot':rs(P,Math.max(2,o.s*1.8)).forEach(p=>{c.beginPath();c.arc(p[0],p[1],Math.max(1,o.s*.5),0,6.283);c.fill()});break;
   case 'pixel':rs(P,Math.max(1,o.s*.5)).forEach(p=>c.fillRect(Math.floor(p[0]/o.s)*o.s,Math.floor(p[1]/o.s)*o.s,o.s,o.s));break;
   default:path();c.stroke()}}
 c.restore()}
const HS=[['nw',0,0],['n',.5,0],['ne',1,0],['e',1,.5],['se',1,1],['s',.5,1],['sw',0,1],['w',0,.5]];
function render(keep){if(!keep)qs();
 const r=stage.getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,Math.sqrt(12e6/Math.max(1,r.width*r.height))),w=Math.round(r.width*dpr),h=Math.round(r.height*dpr);
 if(stage.width!=w||stage.height!=h){stage.width=w;stage.height=h}
 if(!w||!h)return;
 if(!keep)dirty=1;
 const T=()=>sc.setTransform(dpr*view.s,0,0,dpr*view.s,dpr*view.x,dpr*view.y);
 if(SCR){const need=Math.ceil(((r.height-view.y)/view.s+800)/400)*400;if(need>H){H=need;dirty=1}if(view.y>24)view.y=24}
 const sig=[view.x,view.y,view.s,w,h,H].join();if(sig!=cs){cs=sig;dirty=1}
 if(lay.width!=w||lay.height!=h){lay.width=frm.width=w;lay.height=frm.height=h;dirty=1}
 if(dirty){lc.setTransform(1,0,0,1,0,0);lc.clearRect(0,0,w,h);lc.setTransform(dpr*view.s,0,0,dpr*view.s,dpr*view.x,dpr*view.y);
  lc.save();if(SCR){lc.beginPath();lc.rect(0,0,W,H);lc.clip()}
  const x0=-view.x/view.s,x1=(r.width-view.x)/view.s,y0=-view.y/view.s,y1=(r.height-view.y)/view.s;
  objs.forEach(o=>{const m=(o.s||0)*3+30;if(o.x-m<=x1&&o.x+o.w+m>=x0&&o.y-m<=y1&&o.y+o.h+m>=y0)draw(lc,o)});lc.restore();dirty=0}
 let src=lay;
 if(live){fc.setTransform(1,0,0,1,0,0);fc.clearRect(0,0,w,h);fc.drawImage(lay,0,0);fc.setTransform(dpr*view.s,0,0,dpr*view.s,dpr*view.x,dpr*view.y);fc.save();if(SCR){fc.beginPath();fc.rect(0,0,W,H);fc.clip()}draw(fc,live);fc.restore();src=frm}
 sc.setTransform(1,0,0,1,0,0);sc.clearRect(0,0,w,h);T();
 sc.shadowColor='rgba(0,0,0,.35)';sc.shadowBlur=18;sc.fillStyle=bg;sc.fillRect(0,0,W,H);sc.shadowBlur=0;sc.imageSmoothingQuality='high';
 sc.setTransform(1,0,0,1,0,0);sc.drawImage(src,0,0);T();
 {const ab=$('#addsl');if(ab.hidden==!!car)ab.hidden=!car;if(car){const t='+ Add slide ('+car.n+')';if(ab.textContent!=t)ab.textContent=t;
  sc.save();const k=1/view.s;sc.strokeStyle='rgba(120,120,128,.9)';sc.lineWidth=2*k;sc.setLineDash([10*k,8*k]);sc.beginPath();
  for(let i=1;i<car.n;i++){if(car.dir=='h'){sc.moveTo(i*car.sw,0);sc.lineTo(i*car.sw,H)}else{sc.moveTo(0,i*car.sh);sc.lineTo(W,i*car.sh)}}sc.stroke();sc.setLineDash([]);
  sc.font='600 '+13*k+'px sans-serif';sc.textBaseline='top';sc.fillStyle='rgba(120,120,128,.95)';
  for(let i=0;i<car.n;i++)sc.fillText(String(i+1),(car.dir=='h'?i*car.sw:0)+8*k,(car.dir=='v'?i*car.sh:0)+6*k);sc.restore()}}
 if(SCR){const yp=$('#ypos');yp.hidden=false;yp.textContent='Scroll · '+Math.round(-view.y/view.s).toLocaleString()+' px'}else $('#ypos').hidden=true
 if(sel&&tool=='select'&&!sel.ed){const k=1/view.s;sc.strokeStyle='#4f46e5';sc.lineWidth=1.5*k;sc.strokeRect(sel.x,sel.y,sel.w,sel.h);
  sc.fillStyle='#fff';HS.forEach(([n,a,b])=>{const x=sel.x+a*sel.w-4.5*k,y=sel.y+b*sel.h-4.5*k;sc.fillRect(x,y,9*k,9*k);sc.strokeRect(x,y,9*k,9*k)})}
 $('#zoom').textContent=Math.round(view.s*100)+'%';if(window.tbPlace)tbPlace();
 if(typeof liveQueue==='function')liveQueue()}
const wp=e=>{const r=stage.getBoundingClientRect();return[(e.clientX-r.left-view.x)/view.s,(e.clientY-r.top-view.y)/view.s]};
const hit=(o,x,y)=>{if(o.hide||o.br=='eraser')return false;const p=o.t=='stroke'?o.s+6:4;return x>=o.x-p&&x<=o.x+o.w+p&&y>=o.y-p&&y<=o.y+o.h+p};
const hh=(x,y)=>{const k=9/view.s;const f=HS.find(([n,a,b])=>Math.abs(sel.x+a*sel.w-x)<k&&Math.abs(sel.y+b*sel.h-y)<k);return f&&f[0]};
const nm=o=>o.t=='text'?'T: '+o.l.slice(0,14):o.t=='stroke'?(o.br=='eraser'?'eraser':o.pts.length==2&&o.br=='pen'?'stroke':o.br):o.t=='ell'?'ellipse':o.t=='poly'?(o.k||'shape'):o.t=='img'?'image':o.t;
function add(o){o.id=nid++;objs.push(o);sel=o;syncUI();layers();render()}
function setTool(t){tool=t;if(t!='text')$('#tpop').hidden=true;if(t!='select')sel=null;document.querySelectorAll('[data-t]').forEach(b=>b.classList.toggle('on',b.dataset.t==t));
 stage.style.cursor=t=='select'?'default':t=='hand'?'grab':t=='text'?'text':'crosshair';layers();render()}
function fitView(){const r=stage.getBoundingClientRect();if(!r.width||!r.height)return;fitMode=1;if(car){const fw=car.sw,fh=car.sh;view.s=Math.min((r.width-48)/fw,(r.height-48)/fh);view.x=(r.width-fw*view.s)/2;view.y=(r.height-fh*view.s)/2}else if(SCR){view.s=Math.min(2,(r.width-48)/W);view.x=(r.width-W*view.s)/2;view.y=24}
 else{view.s=Math.min((r.width-48)/W,(r.height-48)/H);view.x=(r.width-W*view.s)/2;view.y=(r.height-H*view.s)/2}render()}
