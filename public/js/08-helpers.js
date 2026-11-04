/* Small shared helpers + app-wide state */
let user={name:'Artist',theme:'dark'},me=null,lastUid=null,books=[],tab='all',qv='';
const paint=r=>r.querySelectorAll('[data-ic]').forEach(e=>{if(!e.querySelector(':scope>svg'))e.insertAdjacentHTML('afterbegin',ic(e.dataset.ic))});
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ago=t=>{const s=(Date.now()-t)/1e3;return s<60?'Just now':s<3600?Math.floor(s/60)+' min ago':s<86400?Math.floor(s/3600)+' h ago':new Date(t).toLocaleDateString(undefined,{month:'short',day:'numeric'})};
function toast(m,a,fn){const t=$('#toast');t.innerHTML=`<span>${esc(m)}</span>`+(a?`<button>${a}</button>`:'');if(a)t.querySelector('button').onclick=()=>{fn();t.classList.remove('on')};t.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('on'),4000)}
function avatar(){const a=$('#av');
 if(document.body.classList.contains('studio')&&typeof cur!='undefined'&&cur&&memberBook==cur.id&&members.length>=2){
  const mid=me&&me.id,sorted=[...members].sort((x,y)=>(x.id==mid)-(y.id==mid)),vis0=members.slice(0,4),vis=(mid&&members.some(m=>m.id==mid)&&!vis0.some(m=>m.id==mid))?[...vis0.slice(0,3),members.find(m=>m.id==mid)]:vis0,more=members.length-vis.length;
  a.classList.add('stk');a.title=members.map(m=>m.name).join(', ');
  a.innerHTML=vis.map((m,i)=>pfp(m).replace('class="cpf"','class="cpf'+(m.id==mid?' me':'')+'" data-i="'+i+'"').replace('style="','style="z-index:'+(m.id==mid?20:10-i)+';')).join('')+(more>0?`<span class="cpf cpm">+${more}</span>`:'');return}
 a.classList.remove('stk');a.title='Account';a.textContent=(user.name.trim()[0]||'A').toUpperCase()}
function theme(){const r=document.documentElement;user.theme=='auto'?r.removeAttribute('data-theme'):r.dataset.theme=user.theme;try{brushPrev()}catch(e){}}
