/* Collaboration: invite people to the open paintbook by username */
let members=[],memberBook=null;
const PFC=['#fe713b','#5856d6','#00897b','#ff2d92','#1565c0','#8bc34a','#af52de','#ff9500'];
const pfcol=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return PFC[h%PFC.length]};
const pfp=m=>`<span class="cpf${m.avatar?' has-img':''}" style="background-color:${pfcol(m.id)}${m.avatar?`;background-image:url('${esc(m.avatar)}')`:''}" title="${esc(m.name)}${m.owner?' (owner)':''}">${m.avatar?'':esc((m.name.trim()[0]||'A').toUpperCase())}</span>`;
async function loadMembers(){if(!cur)return;const id=cur.id;try{const r=await api('/books/'+id+'/members');if(cur&&cur.id==id){members=r.members;memberBook=id;cur.isOwner=r.isOwner;avatar();liveStart();if(typeof refreshMemberPresence==='function')refreshMemberPresence()}}catch(e){}}
const memberRow=()=>members.map(pfp).join('');
function invitePop(){const p=$('#pop');if(!p.hidden){p.hidden=1;return}
 if(memberBook!=cur.id)members=[];
 p.innerHTML=`<div class="inv"><b class="invt">Collaborate</b>
<div class="invr"><input id="invi" placeholder="Username" maxlength="60" name="invite-user-x" autocomplete="off" autocapitalize="off" spellcheck="false" data-lpignore="true" data-1p-ignore><button id="invb" class="invbtn" type="button">Invite</button></div>
<div class="aerr" id="inve"></div>
<div class="invl">On this canvas</div><div class="cpfs" id="invm">${memberRow()}</div></div>`;
 p.hidden=0;setTimeout(()=>$('#invi').focus(),30);
 const err=m=>{const e=$('#inve');if(e)e.textContent=m||''};
 const send=async()=>{const v=$('#invi').value.trim();err();if(!v)return err('Enter a username.');
  if(cur.isOwner===false)return err('Only the owner can invite people.');
  const b=$('#invb');b.disabled=true;
  try{const ok=await saveNow();if(ok===false)throw new Error('Could not save the paintbook first.');
   const r=await api('/books/'+cur.id+'/members',{method:'POST',body:{username:v}});members=r.members;memberBook=cur.id;avatar();liveStart();if(typeof refreshMemberPresence==='function')refreshMemberPresence();
   $('#invi').value='';$('#invm').innerHTML=memberRow();toast(members[members.length-1].name+' was added to the canvas')}
  catch(e){err(e.message||'Could not invite.')}
  b.disabled=false};
 $('#invb').onclick=send;$('#invi').onkeydown=e=>{if(e.key=='Enter')send()};
 loadMembers().then(()=>{const m=$('#invm');if(m)m.innerHTML=memberRow();if(typeof refreshMemberPresence==='function')refreshMemberPresence()})}


/* Live canvas sync. Shared paintbooks exchange short-lived snapshots while multiple
   members are present. The server checks membership on every read/write. */
const liveClientId='lc_'+Math.random().toString(36).slice(2)+Date.now().toString(36);
let livePoll=null,livePushTimer=null,liveHeartbeat=null,liveReconnectTimer=null,
 liveCursor=0,liveApplying=false,liveLastSent='',liveLastBook=null,
 liveFailures=0,liveReconnectAttempts=0,livePingBusy=false,livePullBusy=false;
function liveStop(){
 clearInterval(livePoll);livePoll=null;
 clearInterval(liveHeartbeat);liveHeartbeat=null;
 clearTimeout(liveReconnectTimer);liveReconnectTimer=null;
 clearTimeout(livePushTimer);livePushTimer=null;
 liveCursor=0;liveLastSent='';liveSentIk='';liveLastBook=null;
 liveFailures=0;liveReconnectAttempts=0;livePingBusy=false;livePullBusy=false;
}
function liveStart(){
 liveStop();
 if(!cur||members.length<2)return;
 const id=cur.id;liveLastBook=id;
 // Start from zero so a collaborator receives the latest snapshot immediately.
 liveCursor=0;
 livePoll=setInterval(()=>livePull(id),250);
 // Independent heartbeat: every 10 seconds confirm the collaboration endpoint is alive.
 liveHeartbeat=setInterval(()=>livePing(id),10000);
 liveLastSent=JSON.stringify(liveBase()); // we loaded the saved copy; only real edits get pushed
}
async function livePing(id){
 if(livePingBusy||!cur||cur.id!==id||members.length<2)return;
 livePingBusy=true;
 try{
  const r=await Promise.race([
   api('/books/'+id+'/live?ping=1'),
   new Promise((_,reject)=>setTimeout(()=>reject(new Error('Live ping timed out')),5000))
  ]);
  if(!r||r.pong!==true)throw new Error('Live ping failed');
  liveFailures=0;liveReconnectAttempts=0;
 }catch(e){liveMarkFailure(id)}
 finally{livePingBusy=false}
}
function liveMarkFailure(id){
 if(!cur||cur.id!==id||members.length<2)return;
 liveFailures++;
 if(liveFailures>=2)liveReconnect(id);
}
function liveReconnect(id){
 if(liveReconnectTimer||!cur||cur.id!==id||members.length<2)return;
 clearInterval(livePoll);livePoll=null;
 const delay=Math.min(30000,1000*Math.pow(2,Math.min(liveReconnectAttempts,5)));
 liveReconnectAttempts++;
 liveReconnectTimer=setTimeout(async()=>{
  liveReconnectTimer=null;
  if(!cur||cur.id!==id||members.length<2)return;
  try{
   const r=await Promise.race([
    api('/books/'+id+'/live?ping=1'),
    new Promise((_,reject)=>setTimeout(()=>reject(new Error('Reconnect timed out')),5000))
   ]);
   if(!r||r.pong!==true)throw new Error('Reconnect failed');
   liveFailures=0;liveReconnectAttempts=0;
   if(!livePoll)livePoll=setInterval(()=>livePull(id),250);
   liveQueue();
  }catch(e){liveMarkFailure(id);if(!liveReconnectTimer)liveReconnect(id)}
 },delay);
}
const liveHash=t=>{let h=5381;for(let i=0;i<t.length;i++)h=((h<<5)+h+t.charCodeAt(i))>>>0;return h.toString(36)};
const liveIk=()=>liveHash(Object.keys(imgs).sort().join(','));
let liveSentIk='';
const liveBase=()=>({objs:objs.map(o=>({...o,ed:0})),bg,nid,w:W,h:H0,scroll:SCR,pg:PG||undefined,car:(typeof car!=='undefined'&&car)||undefined,live});
async function livePull(id){
 if(livePullBusy||!cur||cur.id!==id||members.length<2)return;
 if(drag)return; // never overwrite what this user is drawing right now
 livePullBusy=true;
 try{
  const r=await api('/books/'+id+'/live?since='+liveCursor+'&ik='+liveIk());
  if(!r.state||!cur||cur.id!==id)return;
  liveCursor=r.updatedAt;
  if(r.clientId===liveClientId)return;
  if(drag)return;
  liveApplying=true;
  const d=r.state;
  if(d.imgs)await Promise.all(Object.entries(d.imgs).map(([key,src])=>{
   if(imgs[key]&&imgSrc(imgs[key])===src)return Promise.resolve();
   return loadImg(src).then(im=>{imgs[key]=im});
  }));
  if(!cur||cur.id!==id||drag){liveApplying=false;liveCursor=0;return}
  PG=d.pg&&d.pg.n>0?{n:Math.min(100,Math.floor(d.pg.n)||1),dir:d.pg.dir=='h'?'h':'v'}:null;
  if(d.w&&(d.w!==W||d.h!==H0))setCanvas(d.w,d.h,d.scroll);
  objs=Array.isArray(d.objs)?d.objs:[];
  bg=d.bg||'#ffffff';$('#bg').value=bg;pgSw();
  live=d.live||null;
  nid=Math.max(d.nid||1,...objs.map(o=>o.id||0))+1;
  sel=null;layers();render(1);dirty=1;
  liveLastSent=JSON.stringify(liveBase()); // what we just received is not a local change
  liveApplying=false;liveFailures=0;
  try{last=JSON.stringify(payload())}catch(e){}
  $('#sv').classList.remove('dirty');$('#st').textContent='Live · synced';
 }catch(e){liveApplying=false;liveMarkFailure(id)}
 finally{livePullBusy=false}
}
// Throttled, one-in-flight push: strokes in progress are broadcast ~every 70 ms, always in order.
let livePushBusy=false,liveErrAt=0;
function liveQueue(){
 if(liveApplying||!cur||members.length<2||cur.id!==liveLastBook||livePushTimer||livePushBusy)return;
 livePushTimer=setTimeout(async()=>{
  livePushTimer=null;
  if(liveApplying||livePushBusy||!cur||members.length<2||cur.id!==liveLastBook)return;
  const base=liveBase();let raw;try{raw=JSON.stringify(base)}catch(e){return}
  const ik=liveIk(),sendImgs=ik!==liveSentIk;
  if(raw===liveLastSent&&!sendImgs)return;
  const state={...base,ik};
  if(sendImgs)state.imgs=Object.fromEntries(Object.entries(imgs).map(([k,v])=>[k,imgSrc(v)]));
  livePushBusy=true;
  try{
   const r=await api('/books/'+cur.id+'/live',{method:'POST',body:{clientId:liveClientId,state}});
   liveLastSent=raw;if(sendImgs)liveSentIk=ik;liveCursor=Math.max(liveCursor,r.updatedAt||0);
  }catch(e){if(Date.now()-liveErrAt>15000){liveErrAt=Date.now();toast('Live sync: '+(e.message||'failed'))}}
  livePushBusy=false;
  if(cur&&members.length>1&&JSON.stringify(liveBase())!==liveLastSent)liveQueue(); // changes made while sending
 },70);
}
/* Shared canvases save themselves: nobody has to press Save. */
let autoT=0;
function liveAutosave(){
 if(!cur||members.length<2)return;
 clearTimeout(autoT);
 autoT=setTimeout(async()=>{if(cur&&members.length>1&&!drag&&isDirty())await saveNow()},1200);
}
