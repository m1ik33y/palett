/* Paintbook data layer: everything is persisted through the API (D1), nothing in the browser */
const MAX_SAVE=9800000;
const patchBook=(m,f)=>api('/books/'+m.id,{method:'PATCH',body:f}).catch(e=>toast(e.message||'Could not save changes'));
const patchMe=b=>api('/me',{method:'PATCH',body:b}).catch(()=>{});
let nt,spT;
const saveMeta=m=>{clearTimeout(nt);nt=setTimeout(()=>patchBook(m,{name:m.name}),500)};
const saveProfile=()=>{clearTimeout(spT);spT=setTimeout(()=>patchMe({name:user.name,theme:user.theme}),400)};
function payload(){const used={};objs.forEach(o=>{if(o.img&&imgs[o.img])used[o.img]=imgs[o.img].src});return{objs,imgs:used,bg,nid,w:W,h:H0,scroll:SCR}}
function thumb(c){const k=document.createElement('canvas');k.width=480;k.height=270;const x=k.getContext('2d');x.fillStyle='#8e8e93';x.fillRect(0,0,480,270);
 if(SCR)x.drawImage(snapshot(0,0,W,W*9/16,480,270),0,0);
 else{const s=Math.min(480/W,270/H),ow=Math.max(1,Math.round(W*s)),oh=Math.max(1,Math.round(H*s));x.drawImage(snapshot(0,0,W,H,ow,oh),(480-ow)/2,(270-oh)/2)}
 c.thumb=k.toDataURL('image/jpeg',.72)}
const isDirty=()=>!!cur&&!loading&&JSON.stringify(payload())!=last;
function qs(){if(!cur||loading)return;clearTimeout(qt);qt=setTimeout(()=>{if(cur)$('#st').textContent=isDirty()?'Unsaved changes':'Saved '+ago(cur.updated).toLowerCase()},500)}
async function saveNow(manual){if(!cur||loading)return;clearTimeout(qt);const c=cur,p=payload(),s=JSON.stringify(p);
  if(s!=last){
    if(s.length>MAX_SAVE){toast('This paintbook is too large to save. Remove some images.');return false}
    thumb(c);
    try{const r=await api('/books/'+c.id,{method:'PUT',body:{payload:p,thumb:c.thumb,w:p.w,h:p.h,scroll:p.scroll?1:0,name:c.name}});last=s;c.updated=r.book.updated}
    catch(e){toast(e.message||'Save failed');return false}}
  $('#st').textContent='Saved '+ago(c.updated).toLowerCase();if(manual)toast('Paintbook saved');return true}
async function open(id){const m=books.find(b=>b.id==id);if(!m)return;loading=1;
  let d;try{d=(await api('/books/'+id)).payload}catch(e){loading=0;toast(e.message||'Could not open paintbook');return}
  d=d||{objs:[],imgs:{},bg:'#ffffff',nid:1};imgs={};
 await Promise.all(Object.entries(d.imgs||{}).map(([k,s])=>new Promise(r=>{const im=new Image();im.onload=im.onerror=()=>{imgs[k]=im;r()};im.src=s})));
 setCanvas(d.w||m.w||1920,d.h||m.h||1080,d.scroll!=null?d.scroll:m.scroll);
 objs=d.objs;bg=d.bg||'#ffffff';$('#bg').value=bg;pgSw();sel=null;hist=[];redo=[];live=null;drag=null;nid=Math.max(d.nid||1,...objs.map(o=>o.id||0))+1;
 cur=m;last=JSON.stringify(payload());loading=0;$('#bn').value=m.name;$('#fv').classList.toggle('fav',!!m.fav);
 go('studio');setTool('brush');layers();setTimeout(fitView,40);$('#st').textContent='Saved '+ago(m.updated).toLowerCase()}
async function newBook(o){o=o||{};const w=o.w||1920,h=o.h||1080;let m;
  try{m=(await api('/books',{method:'POST',body:{name:(o.name||'').trim()||'Untitled '+(books.length+1),title:(o.title||'').trim(),w,h,scroll:o.scroll?1:0,bg:o.bg||'#ffffff'}})).book}
  catch(e){toast(e.message||'Could not create paintbook');throw e}
  books.unshift(m);await open(m.id);
 {const n=parseInt((o.bg||'#ffffff').slice(1),16);if(.299*(n>>16)+.587*(n>>8&255)+.114*(n&255)<110){$('#color').value='#f5f5f5';readUI()}}if(o.tOn&&m.title)addTitle(m.title);if(o.src)addImg(o.src,o.fill)}
function addTitle(t){const n=parseInt(bg.slice(1),16),lum=.299*(n>>16)+.587*(n>>8&255)+.114*(n&255);
 const o=mk({t:'text',x:0,y:0,l:t,fs:Math.max(24,Math.round(Math.min(W,1920)*.045)),f:'Arial',b:1,i:0,c:lum>140?'#111111':'#f5f5f5'});fit(o);o.x=Math.max(20,(W-o.w)/2);o.y=Math.round(Math.min(W,H)*.04);
 o.id=nid++;objs.push(o);layers();render()}
async function dupBook(id){try{const r=await api('/books/'+id+'/duplicate',{method:'POST'});books.unshift(r.book);render_();toast('Duplicated')}catch(e){toast(e.message||'Could not duplicate')}}
/* Delete with Undo: the DELETE request is sent after the undo window closes */
const pendDel=new Map();
function delBook(m){const i=books.indexOf(m);if(i<0)return;books.splice(i,1);render_();
  const t=setTimeout(()=>{pendDel.delete(m.id);api('/books/'+m.id,{method:'DELETE'}).catch(e=>{books.push(m);render_();toast(e.message||'Could not delete')})},5000);
  pendDel.set(m.id,t);
  toast('Deleted “'+m.name+'”','Undo',()=>{clearTimeout(t);pendDel.delete(m.id);books.splice(Math.min(i,books.length),0,m);render_()})}
addEventListener('pagehide',()=>{pendDel.forEach((t,id)=>{clearTimeout(t);fetch('/api/books/'+id,{method:'DELETE',keepalive:true})});pendDel.clear()});
/* Archive: archived paintbooks are only sent by the server while this session is unlocked.
   The browser never holds the password hash or an unlock token (it lives in the server-side session). */
let archOpen=false,archAt=0;const ARCH_MS=7000; // must match ARCH_TTL on the server
async function unlockArch(){archAt=Date.now();const r=await api('/books?archived=1');books=books.filter(b=>!b.arch).concat(r.books);archOpen=true}
function lockArch(){archOpen=false;books=books.filter(b=>!b.arch);api('/archive/lock',{method:'POST'}).catch(()=>{})}
async function archiveBook(m){try{await api('/books/'+m.id,{method:'PATCH',body:{arch:1}});m.arch=1;lockArch();render_();toast('Archived “'+m.name+'”')}catch(e){toast(e.message||'Could not archive')}}
