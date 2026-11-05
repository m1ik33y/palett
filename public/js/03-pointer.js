/* Pointer, wheel and text-editing interaction on the canvas */
const ptrs=new Map();let pz=null;
stage.onpointerdown=e=>{stage.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);if(ptrs.size>1){if(ptrs.size==2){const r=stage.getBoundingClientRect(),[a,b]=[...ptrs.values()];fitMode=0;pz={d:Math.hypot(a[0]-b[0],a[1]-b[1])||1,cx:(a[0]+b[0])/2-r.left,cy:(a[1]+b[1])/2-r.top,v:{...view}};drag=null;live=null;render()}return}const[x,y]=wp(e);
 if(tool=='hand'||spc||e.button==1){fitMode=0;drag={m:'pan',sx:e.clientX,sy:e.clientY,vx:view.x,vy:view.y};return}
 if(tool=='select'){
  if(sel){const hd=hh(x,y);if(hd&&!(sel.t=='text'&&hd.length<2)){drag={m:'rs',hd,o:{...sel},x,y,pre:JSON.stringify(objs)};return}}
  const o=[...objs].reverse().find(o=>hit(o,x,y));sel=o||null;syncUI();layers();
  if(o)drag={m:'mv',o:{...o},x,y,pre:JSON.stringify(objs)};render();return}
 if(tool=='fill'){const o=[...objs].reverse().find(o=>!o.hide&&(o.t=='rect'||o.t=='ell'||o.t=='poly')&&hit(o,x,y));
  if(o){snap();o.df=1;o.fc=st.color}else{bg=st.color;$('#bg').value=bg;pgSw()}sel=null;layers();render();return}
 if(tool=='text'){snap();const o=mk({t:'text',x,y,l:'Text',fs:Math.max(st.size*3,18),f:st.font,b:st.bold,i:st.italic});fit(o);add(o);drag={m:'txt',o};return}
 if(tool=='brush'||tool=='eraser'){const br=tool=='eraser'?'eraser':st.brush;drag={m:'br',raw:[[x,y]],br};live=mk({t:'stroke',br,x:0,y:0,w:1,h:1,pts:drag.raw});render()}else drag={m:'sh',x,y}};
const ch=()=>{if(!drag.ch){hist.push(drag.pre);redo=[];drag.ch=1}};
stage.onpointermove=e=>{if(ptrs.has(e.pointerId))ptrs.set(e.pointerId,[e.clientX,e.clientY]);if(pz){if(ptrs.size<2)return;const r=stage.getBoundingClientRect(),[a,b]=[...ptrs.values()],d=Math.hypot(a[0]-b[0],a[1]-b[1])||1,cx=(a[0]+b[0])/2-r.left,cy=(a[1]+b[1])/2-r.top,ns=Math.min(8,Math.max(.1,pz.v.s*d/pz.d));view.x=cx-(pz.cx-pz.v.x)*ns/pz.v.s;view.y=cy-(pz.cy-pz.v.y)*ns/pz.v.s;view.s=ns;render(1);return}if(!drag||drag.m=='txt')return;const[x,y]=wp(e);
 if(drag.m=='pan'){view.x=drag.vx+e.clientX-drag.sx;view.y=drag.vy+e.clientY-drag.sy}
 else if(drag.m=='mv'){ch();sel.x=drag.o.x+x-drag.x;sel.y=drag.o.y+y-drag.y}
 else if(drag.m=='rs'){ch();const o0=drag.o,d=drag.hd;let X=o0.x,Y=o0.y,Wd=o0.w,Hd=o0.h;
  if(d.includes('e'))Wd+=x-drag.x;if(d.includes('w')){X+=x-drag.x;Wd-=x-drag.x}
  if(d.includes('s'))Hd+=y-drag.y;if(d.includes('n')){Y+=y-drag.y;Hd-=y-drag.y}
  Wd=Math.max(Wd,4);Hd=Math.max(Hd,4);
  if(d.length==2&&(e.shiftKey||sel.t=='text')){const k=Math.max(Wd/o0.w,Hd/o0.h);Wd=o0.w*k;Hd=o0.h*k}
  X=d.includes('w')?o0.x+o0.w-Wd:(d.includes('e')||d.length==1&&'ns'.includes(d)?o0.x:X);Y=d.includes('n')?o0.y+o0.h-Hd:Y;
  if(!d.includes('w')&&!d.includes('e'))X=o0.x;if(!d.includes('n')&&!d.includes('s'))Y=o0.y;
  Object.assign(sel,{x:X,y:Y,w:Wd,h:Hd});
  if(sel.t=='text'){sel.fs=Math.max(6,o0.fs*Hd/o0.h);fit(sel);if(d.includes('w'))sel.x=o0.x+o0.w-sel.w;if(d.includes('n'))sel.y=o0.y+o0.h-sel.h}}
 else if(drag.m=='br'){const raw=drag.raw;const co=e.getCoalescedEvents?e.getCoalescedEvents():[];for(const q of(co.length?co:[e])){const[a,b]=wp(q),l=raw[raw.length-1];if(Math.hypot(a-l[0],b-l[1])>=1)raw.push([a,b])}req();return}
 else{let w=x-drag.x,h=y-drag.y;if(e.shiftKey&&st.shape!='line'){const m=Math.max(Math.abs(w),Math.abs(h));w=Math.sign(w||1)*m;h=Math.sign(h||1)*m}
  const X=Math.min(drag.x,drag.x+w),Y=Math.min(drag.y,drag.y+h),A=Math.abs(w),B=Math.abs(h);
  live=st.shape=='line'?mk({t:'stroke',br:'pen',x:X,y:Y,w:Math.max(A,1),h:Math.max(B,1),pts:[[w>=0?0:1,h>=0?0:1],[w>=0?1:0,h>=0?1:0]]}):mk({t:st.shape=='rect'||st.shape=='ell'?st.shape:'poly',k:st.shape,x:X,y:Y,w:A,h:B})}
 render()};
stage.onpointerup=e=>{ptrs.delete(e.pointerId);if(pz){if(ptrs.size<2)pz=null;return}if(!drag)return;if(drag.m=='txt'){const o=drag.o;drag=null;setTimeout(()=>editText(o),0);return}const m=drag.m;
 if(m=='br'){snap();const o=bb(drag.raw,drag.br);o.id=nid++;objs.push(o);layers()}
 else if(m=='sh'&&live&&(live.w>3||live.h>3)){snap();const o=live;live=null;drag=null;add(o);return}
 if(m=='mv'||m=='rs')layers();
 live=null;drag=null;render()};
stage.onpointercancel=e=>{ptrs.delete(e.pointerId);if(pz&&ptrs.size<2)pz=null;live=null;drag=null;render()};
stage.ondblclick=e=>{if(tool!='select')return;const[x,y]=wp(e);const o=[...objs].reverse().find(o=>hit(o,x,y));
 if(o&&o.t=='text'){sel=o;snap();editText(o)}};
stage.onwheel=e=>{e.preventDefault();fitMode=0;const r=stage.getBoundingClientRect();
 if(SCR&&!e.ctrlKey){const k=e.deltaMode==1?16:e.deltaMode==2?r.height:1;view.y-=e.deltaY*k;view.x-=e.deltaX*k;render(1);return}
 const mx=e.clientX-r.left,my=e.clientY-r.top,
 ns=Math.min(8,Math.max(.1,view.s*Math.exp(-e.deltaY*.0015)));view.x=mx-(mx-view.x)*ns/view.s;view.y=my-(my-view.y)*ns/view.s;view.s=ns;render()};
function editText(o){
 if(window.tbEnd)window.tbEnd();o.ed=1;sel=o;render();
 const P=10,box=document.createElement('div'),t=document.createElement('textarea'),CUR={nw:'nwse',se:'nwse',ne:'nesw',sw:'nesw',n:'ns',s:'ns',e:'ew',w:'ew'};
 box.className='tbox';HS.forEach(([n,a,b])=>{const i=document.createElement('i');i.dataset.h=n;i.style.cssText='left:'+a*100+'%;top:'+b*100+'%;cursor:'+CUR[n]+'-resize';box.append(i)});
 t.value=o.l;t.spellcheck=false;box.append(t);document.body.append(box);
 const place=()=>{const r=stage.getBoundingClientRect();
  Object.assign(box.style,{left:r.left+view.x+o.x*view.s-P+'px',top:r.top+view.y+o.y*view.s-P+'px',width:o.w*view.s+2*P+'px',height:o.h*view.s+2*P+'px'});
  Object.assign(t.style,{left:P+'px',top:P+'px',width:o.w*view.s+6+'px',height:o.h*view.s+'px',font:fontStr(o,view.s),color:o.c,caretColor:o.c})};
 const finish=()=>{if(!box.isConnected)return;o.l=t.value;o.ed=0;box.remove();document.removeEventListener('pointerdown',out,true);window.tbPlace=window.tbEnd=null;
  if(!o.l.trim()){objs=objs.filter(q=>q!==o);sel=null}else fit(o);layers();render()};
 const out=e=>{if(!box.contains(e.target)&&!e.target.closest('#tpop,[data-t=text]'))finish()};
 document.addEventListener('pointerdown',out,true);window.tbPlace=place;window.tbEnd=finish;
 box.addEventListener('mousedown',e=>{if(e.target!==t)e.preventDefault()});
 box.onpointerdown=e=>{if(e.target===t)return;const h=e.target.dataset&&e.target.dataset.h;box.setPointerCapture(e.pointerId);
  const o0={x:o.x,y:o.y,w:o.w,h:o.h,fs:o.fs},sx=e.clientX,sy=e.clientY;
  box.onpointermove=ev=>{const dx=(ev.clientX-sx)/view.s,dy=(ev.clientY-sy)/view.s;
   if(!h){o.x=o0.x+dx;o.y=o0.y+dy}else{const w=o0.w+(h.includes('e')?dx:h.includes('w')?-dx:0),H=o0.h+(h.includes('s')?dy:h.includes('n')?-dy:0),
    k=h.length==2?Math.max(w/o0.w,H/o0.h):(h=='e'||h=='w')?w/o0.w:H/o0.h;o.fs=Math.max(6,o0.fs*k);fit(o);
    if(h.includes('w'))o.x=o0.x+o0.w-o.w;if(h.includes('n'))o.y=o0.y+o0.h-o.h}
   place()};
  box.onpointerup=()=>{box.onpointermove=null;t.focus()}};
 t.oninput=()=>{o.l=t.value;fit(o);place()};
 t.onkeydown=e=>{if(e.key=='Escape'||(e.key=='Enter'&&!e.shiftKey)){e.preventDefault();finish()}e.stopPropagation()};
 fit(o);place();t.focus();t.select()}
