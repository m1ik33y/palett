/* Phone only: every menu is a bottom sheet over a light overlay; item menus open by press-and-hold. */
(()=>{
const q=s=>document.querySelector(s);
const SHEETS=[
 ['#fmenu',()=>fmHide()],['#cmenu',()=>cmHide()],['#pop',e=>e.hidden=true],['#mnu',e=>e.hidden=true],
 ['#shf',e=>e.hidden=true],['#sech',e=>e.hidden=true],['#bpop',e=>e.hidden=true],['#tpop',e=>e.hidden=true]];
const shown=e=>!!e&&!e.hidden;
const work=q('#work'),bd=q('#sbd');

/* ---- one shared overlay for all sheets (the modal/confirm sheets bring their own) ---- */
function anyOpen(){
 if(!PH.matches)return false;
 return SHEETS.some(([s])=>shown(q(s)))||shown(q('#layers'))||work.classList.contains('bo')}
function sync(){bd.hidden=!anyOpen()}
function closeTop(){
 if(!PH.matches)return false;
 if(shown(q('#dlg'))){q('#dlg').hidden=true;sync();return true}
 if(shown(q('#mdl'))){q('#mdl').hidden=true;sync();return true}
 for(const [s,f] of SHEETS){const e=q(s);if(shown(e)){f(e);sync();return true}}
 if(shown(q('#layers'))){showPanel('paint');sync();return true}
 if(work.classList.contains('bo')){work.classList.remove('bo');sync();return true}
 return false}
window.sheetsCloseTop=closeTop;
const mo=new MutationObserver(sync);
SHEETS.concat([['#layers']]).forEach(([s])=>{const e=q(s);if(e)mo.observe(e,{attributes:true,attributeFilter:['hidden']})});
mo.observe(work,{attributes:true,attributeFilter:['class']});
PH.addEventListener('change',sync);
bd.addEventListener('click',e=>{e.preventDefault();while(closeTop());sync()});

/* ---- swipe a sheet down to dismiss it ---- */
function swipe(el,close){
 if(!el)return;let y0=0,dy=0,arm=0,on=0;
 el.addEventListener('touchstart',e=>{
  if(!PH.matches||e.touches.length!=1||e.target.closest('input,textarea,select,.sk,[contenteditable=true]')){arm=0;return}
  arm=el.scrollTop<=0;y0=e.touches[0].clientY;dy=0;on=0},{passive:true});
 el.addEventListener('touchmove',e=>{
  if(!arm)return;dy=e.touches[0].clientY-y0;
  if(dy>8){on=1;el.style.transition='none';el.style.transform='translateY('+dy+'px)'}else if(on){el.style.transform=''}},{passive:true});
 el.addEventListener('touchend',()=>{
  if(!arm)return;arm=0;el.style.transition='transform .18s ease-out';
  const done=on&&dy>90;el.style.transform='';if(done)close();
  setTimeout(()=>{el.style.transition=''},220);on=0},{passive:true});
 el.addEventListener('touchcancel',()=>{arm=0;on=0;el.style.transform='';el.style.transition=''},{passive:true})}
SHEETS.forEach(([s,f])=>{const e=q(s);swipe(e,()=>{f(e);sync()})});
swipe(q('#mdl .mbox'),()=>{q('#mdl').hidden=true;sync()});
swipe(q('#dlg .dbox'),()=>{q('#dlg').hidden=true;sync()});

/* ---- press-and-hold on a paintbook card or an explorer file opens its menu ---- */
const HOLD=450,MOVE=10;
let timer=0,mark=0,tgt=null,sx=0,sy=0,holding=false,until=0;
const pick=el=>el&&el.closest?(el.closest('.card')||el.closest('[data-fid]')):null;
function cancel(){clearTimeout(timer);clearTimeout(mark);timer=mark=0;if(tgt){tgt.classList.remove('lp');tgt=null}}
function openMenu(el){
 try{navigator.vibrate&&navigator.vibrate(14)}catch(_){}
 if(el.classList.contains('card'))cmShow(el,el.dataset.id);else fmShow(el,el.dataset.fid)}
function fire(el){
 holding=true;until=Date.now()+900;openMenu(el)}
addEventListener('pointerdown',e=>{
 holding=false;
 if(!PH.matches||(e.pointerType=='mouse'&&e.button!==0))return;
 if(e.target.closest('input,textarea,[contenteditable=true]'))return;
 const el=pick(e.target);if(!el)return;
 cancel();tgt=el;sx=e.clientX;sy=e.clientY;
 mark=setTimeout(()=>{if(tgt)tgt.classList.add('lp')},140);
 timer=setTimeout(()=>{const t=tgt;cancel();if(t)fire(t)},HOLD)},true);
addEventListener('pointermove',e=>{if(tgt&&Math.hypot(e.clientX-sx,e.clientY-sy)>MOVE)cancel()},true);
addEventListener('pointerup',()=>{cancel();if(holding){until=Date.now()+350;holding=false}},true);
addEventListener('pointercancel',cancel,true);
/* the lift of the finger that opened a menu must not tap the card or dismiss the new sheet */
document.addEventListener('click',e=>{
 if(holding||Date.now()<until){e.preventDefault();e.stopPropagation();e.stopImmediatePropagation()}},true);
/* Android long-press also raises a context menu / text selection: use it as a fallback trigger */
addEventListener('contextmenu',e=>{
 if(!PH.matches)return;const el=pick(e.target);if(!el)return;
 e.preventDefault();
 if(!holding&&!el.classList.contains('mo')){cancel();fire(el)}},true);
addEventListener('selectstart',e=>{
 const t=e.target.nodeType==3?e.target.parentElement:e.target;
 if(PH.matches&&t&&pick(t)&&!t.closest('input,textarea,[contenteditable=true]'))e.preventDefault()},true);
sync();
})();
