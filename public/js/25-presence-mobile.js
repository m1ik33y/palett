/* Global online presence + mobile navigation and sheet gestures. */
let presenceBeat=0,presencePaint=0;
async function presencePing(){
 if(!me)return;
 try{await api('/presence',{method:'POST',body:{}})}catch(e){}
}
async function refreshMemberPresence(){
 if(!members.length)return;
 try{
  const ids=members.map(m=>m.id).join(',');
  const r=await api('/presence?ids='+encodeURIComponent(ids));
  const online=new Set(r.online||[]);
  document.querySelectorAll('#invm .cpf').forEach((el,i)=>{
   const m=members[i];if(m)el.classList.toggle('online',online.has(m.id));
  });
  // Keep the stacked avatar row in sync with presence state.
  document.querySelectorAll('#av .cpf').forEach(el=>{
   const i=Number(el.dataset.i),m=(typeof members!=='undefined'?members:[]).find(x=>x.id===me?.id) ;
   const label=el.getAttribute('title')||'';
   const target=members.find(x=>x.name===label.split(' (')[0]);
   if(target)el.classList.toggle('online',online.has(target.id));
  });
 }catch(e){}
}
function presenceStart(){
 clearInterval(presenceBeat);clearInterval(presencePaint);
 presencePing();presenceBeat=setInterval(presencePing,15000);
 presencePaint=setInterval(refreshMemberPresence,10000);
 document.addEventListener('visibilitychange',()=>{if(!document.hidden)presencePing()});
}
function mobileNavInit(){
 const brand=document.querySelector('.brand .logo'),slot=document.querySelector('#mobile-nav .mbrand');
 if(brand&&slot)slot.innerHTML=brand.innerHTML;
 const items=document.querySelectorAll('#mobile-nav [data-mnav]');
 items.forEach(b=>b.addEventListener('click',()=>{
  const k=b.dataset.mnav;
  if(k==='home')go('home');
  else if(k==='books')go('lib','all');
  else if(k==='settings')go('set');
  else if(k==='create')openNew('blank');
  else if(k==='folder'){fopen=!fopen;$('#ft').hidden=!fopen;$('#fb').classList.toggle('fo',fopen);fsave();go('lib','all')}
  items.forEach(x=>x.classList.toggle('on',x===b));
 }));
 const sync=()=>items.forEach(b=>{
  const k=b.dataset.mnav,active=(k==='home'&&document.body.classList.contains('home'))||
   (k==='books'&&document.body.classList.contains('lib'))||
   (k==='settings'&&document.body.classList.contains('set'));
  b.classList.toggle('on',active);
 });
 const oldGo=window.go;
 if(!window.__mobileGoWrapped&&typeof oldGo==='function'){
  window.go=function(...args){const r=oldGo(...args);sync();return r};
  window.__mobileGoWrapped=true;
 }
 sync();
}
function enableSheetDrag(el){
 if(!el)return;
 let y0=0,dy=0,dragging=false;
 el.addEventListener('touchstart',e=>{if(e.target.closest('input,textarea,select,button'))return;y0=e.touches[0].clientY;dy=0;dragging=true},{passive:true});
 el.addEventListener('touchmove',e=>{if(!dragging)return;dy=e.touches[0].clientY-y0;if(dy>0)el.style.transform='translateY('+Math.min(dy,260)+'px)'},{passive:true});
 el.addEventListener('touchend',()=>{if(!dragging)return;dragging=false;el.style.transition='transform .18s';if(dy>110){if(el.id==='pop')el.hidden=true;else if(el.id==='mdl')el.hidden=true}el.style.transform='';setTimeout(()=>el.style.transition='',200)},{passive:true});
}
addEventListener('DOMContentLoaded',()=>{
 mobileNavInit();enableSheetDrag(document.querySelector('#pop'));enableSheetDrag(document.querySelector('#mdl .mbox'));
});
