/* Small shared helpers + app-wide state */
let user={name:'Artist',theme:'dark'},me=null,lastUid=null,books=[],tab='all',qv='';
const paint=r=>r.querySelectorAll('[data-ic]').forEach(e=>{if(!e.querySelector(':scope>svg'))e.insertAdjacentHTML('afterbegin',ic(e.dataset.ic))});
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ago=t=>{const s=(Date.now()-t)/1e3;return s<60?'Just now':s<3600?Math.floor(s/60)+' min ago':s<86400?Math.floor(s/3600)+' h ago':new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric'})};
function toast(m,a,fn){const t=$('#toast');t.innerHTML=`<span>${esc(m)}</span>`+(a?`<button>${a}</button>`:'');if(a)t.querySelector('button').onclick=()=>{fn();t.classList.remove('on')};t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),4000)}
function avatar(){const b=$('#av'),u=user.avatar;b.textContent=u?'':(user.name.trim()[0]||'A').toUpperCase();b.style.backgroundImage=u?`url("${u}")`:'';b.classList.toggle('has-img',!!u)}
function theme(){const r=document.documentElement;user.theme=='auto'?r.removeAttribute('data-theme'):r.dataset.theme=user.theme;try{brushPrev()}catch(e){}
 /* Browser bars / Android system bars always match the page: black in dark mode, white in light mode. */
 try{const dk=isDark(),ms=document.querySelectorAll('meta[name=theme-color]');ms.forEach((m,i)=>{if(i)m.remove()});const m=ms[0];if(m){m.removeAttribute('media');m.content=dk?'#000000':'#ffffff'}
  if(window.PalettApp&&PalettApp.setTheme)PalettApp.setTheme(dk)}catch(e){}}
try{matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{if(user.theme=='auto')theme()})}catch(e){}
