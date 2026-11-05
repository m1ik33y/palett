/* Dashboard: cards, home and library views */
const card=b=>`<div class="card" data-id="${b.id}"><div class="th" style="${b.thumb?`background-image:url(${b.thumb})`:''}">${b.thumb?'':ic('palette')}</div>${b.fav?`<span class="fbadge" title="Favourite">${ic('star',14)}</span>`:''}<div class="meta"><div class="nm"><b>${esc(b.name)}</b><small>${b.shared?'Shared · ':''}${b.title?esc(b.title)+' · ':''}${ago(b.updated)}</small></div>
<button class="ib mm" data-a="more" title="More" aria-label="More options" aria-haspopup="menu">${ic('dots',18)}</button></div></div>`;
const grid=(l,msg)=>`<div class="grid">${l.length?l.map(card).join(''):`<div class="empty">${msg}</div>`}</div>`;
const vis=()=>books.filter(b=>!b.arch),byUp=()=>[...vis()].sort((a,b)=>b.updated-a.updated),match=b=>b.name.toLowerCase().includes(qv.toLowerCase());
function home(){const h=new Date().getHours(),g=h<12?'Good morning':h<18?'Good afternoon':'Good evening',rec=byUp(),fav=vis().filter(b=>b.fav);
 $('#v-home').innerHTML=`<h1>${g}, ${esc(user.name)}</h1><div class="mut">${vis().length?'Pick up where you left off or start something new.':'Create your first paintbook to get started.'}</div>
${vis().length?`<div class="stats" style="margin-top:18px"><span><b>${vis().length}</b> paintbooks</span><span><b>${fav.length}</b> favourites</span></div>`:''}
${rec.length?`<div class="sec"><h2>Recent</h2><div class="grow"></div><button class="lnk" data-go="recent">See all</button></div>${grid(rec.slice(0,4))}`:''}
${fav.length?`<div class="sec"><h2>Favourites</h2><div class="grow"></div><button class="lnk" data-go="fav">See all</button></div>${grid(fav.slice(0,4))}`:''}`}
function lib(){let l=tab=='recent'?byUp().slice(0,24):tab=='fav'?byUp().filter(b=>b.fav):byUp();if(qv)l=l.filter(match);
 const T={all:'All paintbooks',recent:'Recents',fav:'Favourites'};
 if(tab=='all'){$('#v-lib').innerHTML='<h1>My Studio</h1>';return}
 $('#v-lib').innerHTML=`<h1>${T[tab]}</h1><div class="pills">${Object.entries(T).map(([k,v])=>`<button data-go="${k}" class="${k==tab?'on':''}">${v}</button>`).join('')}</div>${grid(l,qv?'No paintbooks match your search.':'Nothing here yet.')}`}
const render_=()=>{if(document.body.classList.contains('home'))home();if(document.body.classList.contains('lib'))lib();if(document.body.classList.contains('sec'))secret();ftRender()};
/* Card "more" dropdown: Favourite, Duplicate, Rename, Delete (+ Unarchive in the secret folder) */
let cmid=null;
function cmHide(){const m=$('#cmenu');if(m.hidden)return;m.hidden=1;document.querySelectorAll('.card.mo').forEach(e=>e.classList.remove('mo'))}
function cmShow(btn,id){const m=books.find(b=>b.id==id);if(!m)return;const fm=$('#cmenu');
 if(!fm.hidden&&cmid==id){cmHide();return}
 cmHide();cmid=id;btn.closest('.card').classList.add('mo');
 fm.innerHTML=`<button data-cm="fav">${ic('star',16)}${m.fav?'Remove from favourites':'Add to favourites'}</button><button data-cm="dup">${ic('copy',16)}Duplicate</button><button data-cm="ren">${ic('edit',16)}Rename</button>${m.arch?`<button data-cm="unarch">${ic('archive',16)}Unarchive</button>`:''}<button data-cm="del" class="dng">${ic('trash',16)}Delete</button>`;
 fm.hidden=0;const r=btn.getBoundingClientRect(),w=fm.offsetWidth,h=fm.offsetHeight;
 fm.style.left=Math.max(8,Math.min(innerWidth-w-8,r.right-w))+'px';
 fm.style.top=(r.bottom+4+h>innerHeight-8?Math.max(8,r.top-h-4):r.bottom+4)+'px'}
function renCard(id){const c=[...document.querySelectorAll('.card')].find(x=>x.dataset.id==id),m=books.find(b=>b.id==id);if(!c||!m)return;const b=c.querySelector('b');
 b.contentEditable=true;b.focus();getSelection().selectAllChildren(b);
 b.onkeydown=ev=>{if(ev.key=='Enter'){ev.preventDefault();b.blur()}};
 b.onblur=()=>{b.contentEditable=false;m.name=b.textContent.trim()||m.name;patchBook(m,{name:m.name});render_()}}
$('#cmenu').onclick=e=>{const b=e.target.closest('[data-cm]');if(!b)return;const id=cmid,m=books.find(x=>x.id==id);cmHide();if(!m)return;const k=b.dataset.cm;
 if(k=='fav'){m.fav=m.fav?0:1;patchBook(m,{fav:m.fav});render_()}
 else if(k=='dup')dupBook(id);
 else if(k=='del')delBook(m);
 else if(k=='unarch')api('/books/'+m.id,{method:'PATCH',body:{arch:0}}).then(()=>{m.arch=0;render_()}).catch(er=>toast(er.message||'Could not unarchive'));
 else if(k=='ren')renCard(id)};
addEventListener('keydown',e=>{if(e.key=='Escape')cmHide()});addEventListener('resize',cmHide);document.addEventListener('scroll',cmHide,true);
