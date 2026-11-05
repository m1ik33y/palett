/* Brush preview, popover, sketchy sliders, side panel */
const BRN={pen:'Pen',ball:'Ballpoint',dip:'Dip pen',ink:'Ink brush',pencil:'Pencil',charcoal:'Charcoal',crayon:'Crayon',marker:'Marker',hl:'Highlighter',air:'Airbrush',spray:'Spray',water:'Watercolour',oil:'Oil paint',neon:'Neon',dash:'Dashed',dot:'Dotted',pixel:'Pixel'};
const wave=(w,h,n,amp,x0)=>Array.from({length:n},(_,i)=>{const t=i/(n-1);return[x0+t*(w-2*x0),h/2+amp*Math.sin(t*6.9)]});
function brushPrev(){const ink=getComputedStyle(document.documentElement).getPropertyValue('--ink').trim().replace(/^#(.)(.)(.)$/,'#$1$1$2$2$3$3')||'#000000';
 document.querySelectorAll('.bb[data-b] canvas').forEach(cv=>{const k=cv.parentNode.dataset.b,x=cv.getContext('2d');x.setTransform(2,0,0,2,0,0);x.clearRect(0,0,96,34);const o=bb(wave(96,34,36,7,10),k);Object.assign(o,{c:ink,s:k=='pixel'?4:6,op:1});draw(x,o)})}
function bpPrev(){const cv=$('#bpv'),x=cv.getContext('2d');x.setTransform(2,0,0,2,0,0);x.fillStyle=bg;x.fillRect(0,0,260,70);draw(x,bb(wave(260,70,60,12,22),st.brush))}
function skUpd(){const sz=+$('#size').value,op=+$('#op').value;
 document.querySelectorAll('.sk').forEach(el=>{const n=el.querySelector('.skn');if(!n)return;const k=el.dataset.k;let t=k=='size'?Math.sqrt((sz-1)/79):(op-5)/95;const dt=(window.skT||{})[k];if(dt!=null)t=dt;el.style.setProperty('--t',t);
  el.style.setProperty('--cc',st.color);n.style.left=(4+t*92)+'%';if(k=='size'){const d=8+(sz-1)/79*22;n.style.width=n.style.height=d+'px'}});
 document.querySelectorAll('[data-v=size]').forEach(e=>e.textContent=sz);document.querySelectorAll('[data-v=op]').forEach(e=>e.textContent=op+'%');
 if($('#bpop')&&!$('#bpop').hidden)bpPrev()}
let skd=null;
window.skT={};
let skR=0,skP=null;
function skFlush(){cancelAnimationFrame(skR);skR=0;if(!skP)return;const{el,t}=skP,sz=el.dataset.k=='size',inp=$(sz?'#size':'#op');skP=null;inp.value=sz?Math.round(1+79*t*t):Math.round(5+95*t);inp.dispatchEvent(new Event('input'))}
function skSet(e){const el=skd,r=el.getBoundingClientRect(),t=Math.min(1,Math.max(0,(e.clientX-r.left-r.width*.04)/(r.width*.92))),k=el.dataset.k;skT[k]=t;
 document.querySelectorAll('.sk[data-k="'+k+'"]').forEach(x=>{x.style.setProperty('--t',t);x.querySelector('.skn').style.left=(4+t*92)+'%'});
 skP={el,t};if(!skR)skR=requestAnimationFrame(skFlush)}
document.addEventListener('pointerdown',e=>{const el=e.target.closest('.sk');if(!el)return;skd=el;el.setPointerCapture(e.pointerId);skSet(e)});
document.addEventListener('pointermove',e=>{if(skd)skSet(e)});
document.addEventListener('pointerup',()=>{if(skd){skFlush();const id=skd.dataset.k=='size'?'size':'op';skd=null;skT={};skUpd();$('#'+id).dispatchEvent(new Event('change'))}});
function openBp(el){const r=el.getBoundingClientRect(),p=$('#bpop');p.hidden=0;$('#bpn').textContent=BRN[st.brush]||'Brush';bpPrev();skUpd();
 const w=290,h=p.offsetHeight||330;let x=r.left-w-12;if(x<10)x=Math.min(innerWidth-w-10,Math.max(10,r.left));
 p.style.left=x+'px';p.style.top=Math.min(Math.max(70,r.top-20),Math.max(70,innerHeight-h-10))+'px'}
$('#side').addEventListener('dblclick',e=>{const b=e.target.closest('[data-b]');if(b)openBp(b)});
document.querySelector('[data-t=brush]').ondblclick=e=>openBp(e.currentTarget);
$('#bpx').onclick=()=>$('#bpop').hidden=1;
document.addEventListener('click',e=>{if(!e.target.closest('#bpop')&&!e.target.closest('[data-b],[data-t=brush]'))$('#bpop').hidden=1});
addEventListener('keydown',e=>{if(e.key=='Escape'){$('#bpop').hidden=1;$('#shf').hidden=1;$('#mnu').hidden=1}});
function showPanel(m){$('#side').hidden=false;$('#lay2').classList.toggle('on',m=='layers');$('#pan').classList.toggle('on',m!='layers');$('#pnl').hidden=m!='paint';$('#layers').hidden=m!='layers';$('#lyr').classList.toggle('on',m=='layers');
 $('#side>h4').innerHTML=ic(m=='layers'?'layers':'palette',20)+'<span id="sht">'+(m=='layers'?'Layers':'Colour &amp; brush')+'</span>';if(m=='layers')layers();fitView()}
$('#lyr').onclick=()=>showPanel(!$('#side').hidden&&!$('#layers').hidden?'paint':'layers');

/* Phone: brush list opens from a button next to the size slider */
(()=>{const w=$('#work'),b=$('#brt');if(!w||!b)return;
 b.onclick=e=>{e.stopPropagation();w.classList.toggle('bo')};
 $('#side').addEventListener('click',e=>{if(e.target.closest('[data-b]'))w.classList.remove('bo')});
 document.addEventListener('pointerdown',e=>{if(!e.target.closest('.bgrid,#brt'))w.classList.remove('bo')})})();
