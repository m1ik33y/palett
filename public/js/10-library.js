/* Dashboard: cards, home and library views */
const card=b=>`<div class="card" data-id="${b.id}"><div class="th" style="${b.thumb?`background-image:url(${b.thumb})`:''}">${b.thumb?'':ic('palette')}</div><div class="meta"><div class="nm"><b>${esc(b.name)}</b><small>${b.title?esc(b.title)+' · ':''}${ago(b.updated)}</small></div>
<button class="ib ${b.fav?'fav':''}" data-a="fav" title="Favourite">${ic('star',22)}</button><button class="ib" data-a="dup" title="Duplicate">${ic('copy',22)}</button><button class="ib" data-a="ren" title="Rename">${ic('edit',22)}</button><button class="ib" data-a="del" title="Delete">${ic('trash',22)}</button>${b.arch?`<button class="ib" data-a="unarch" title="Unarchive">${ic('archive',22)}</button>`:''}</div></div>`;
const grid=(l,msg)=>`<div class="grid">${l.length?l.map(card).join(''):`<div class="empty">${msg}</div>`}</div>`;
const vis=()=>books.filter(b=>!b.arch),byUp=()=>[...vis()].sort((a,b)=>b.updated-a.updated),match=b=>b.name.toLowerCase().includes(qv.toLowerCase());
function home(){const h=new Date().getHours(),g=h<12?'Good morning':h<18?'Good afternoon':'Good evening',rec=byUp(),fav=vis().filter(b=>b.fav);
 $('#v-home').innerHTML=`<h1>${g}, ${esc(user.name)}</h1><div class="mut">${vis().length?'Pick up where you left off or start something new.':'Create your first paintbook to get started.'}</div>${archTile()}
${vis().length?`<div class="stats" style="margin-top:18px"><span><b>${vis().length}</b> paintbooks</span><span><b>${fav.length}</b> favourites</span></div>`:''}
${rec.length?`<div class="sec"><h2>Recent</h2><div class="grow"></div><button class="lnk" data-go="recent">See all</button></div>${grid(rec.slice(0,4))}`:''}
${fav.length?`<div class="sec"><h2>Favourites</h2><div class="grow"></div><button class="lnk" data-go="fav">See all</button></div>${grid(fav.slice(0,4))}`:''}`}
function lib(){let l=tab=='recent'?byUp().slice(0,24):tab=='fav'?byUp().filter(b=>b.fav):byUp();if(qv)l=l.filter(match);
 const T={all:'All paintbooks',recent:'Recents',fav:'Favourites'};
 if(tab=='all'){$('#v-lib').innerHTML='<h1>My Studio</h1>'+archTile();return}
 $('#v-lib').innerHTML=`<h1>${T[tab]}</h1><div class="pills">${Object.entries(T).map(([k,v])=>`<button data-go="${k}" class="${k==tab?'on':''}">${v}</button>`).join('')}</div>${archTile()}${grid(l,qv?'No paintbooks match your search.':'Nothing here yet.')}`}
const render_=()=>{if(document.body.classList.contains('home'))home();if(document.body.classList.contains('lib'))lib();if(document.body.classList.contains('arch'))archPage();ftRender()};
