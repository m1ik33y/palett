/* Collaboration: invite people to the open paintbook by username */
let members=[],memberBook=null;
const PFC=['#fe713b','#5856d6','#00897b','#ff2d92','#1565c0','#8bc34a','#af52de','#ff9500'];
const pfcol=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return PFC[h%PFC.length]};
const pfp=m=>`<span class="cpf" style="background:${pfcol(m.id)}" title="${esc(m.name)}${m.owner?' (owner)':''}">${esc((m.name.trim()[0]||'A').toUpperCase())}</span>`;
async function loadMembers(){if(!cur)return;const id=cur.id;try{const r=await api('/books/'+id+'/members');if(cur&&cur.id==id){members=r.members;memberBook=id;cur.isOwner=r.isOwner;avatar();liveStart()}}catch(e){}}
const memberRow=()=>members.map(pfp).join('');
function invitePop(){const p=$('#pop');if(!p.hidden){p.hidden=1;return}
 if(memberBook!=cur.id)members=[];
 p.innerHTML=`<div class="inv"><b class="invt">Collaborate</b>
<div class="invr"><input id="invi" placeholder="Username" maxlength="60" autocomplete="off" spellcheck="false"><button id="invb" class="invbtn">Invite</button></div>
<div class="aerr" id="inve"></div>
<div class="invl">On this canvas</div><div class="cpfs" id="invm">${memberRow()}</div></div>`;
 p.hidden=0;setTimeout(()=>$('#invi').focus(),30);
 const err=m=>{const e=$('#inve');if(e)e.textContent=m||''};
 const send=async()=>{const v=$('#invi').value.trim();err();if(!v)return err('Enter a username.');
  if(cur.isOwner===false)return err('Only the owner can invite people.');
  const b=$('#invb');b.disabled=true;
  try{const ok=await saveNow();if(ok===false)throw new Error('Could not save the paintbook first.');
   const r=await api('/books/'+cur.id+'/members',{method:'POST',body:{username:v}});members=r.members;memberBook=cur.id;avatar();liveStart();
   $('#invi').value='';$('#invm').innerHTML=memberRow();toast(members[members.length-1].name+' was added to the canvas')}
  catch(e){err(e.message||'Could not invite.')}
  b.disabled=false};
 $('#invb').onclick=send;$('#invi').onkeydown=e=>{if(e.key=='Enter')send()};
 loadMembers().then(()=>{const m=$('#invm');if(m)m.innerHTML=memberRow()})}


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
 liveCursor=0;liveLastSent='';liveLastBook=null;
 liveFailures=0;liveReconnectAttempts=0;livePingBusy=false;livePullBusy=false;
}
function liveStart(){
 liveStop();
 if(!cur||members.length<2)return;
 const id=cur.id;liveLastBook=id;
 // Start from zero so a collaborator receives the latest snapshot immediately.
 liveCursor=0;
 livePoll=setInterval(()=>livePull(id),400);
 // Independent heartbeat: every 10 seconds confirm the collaboration endpoint is alive.
 liveHeartbeat=setInterval(()=>livePing(id),10000);
 liveQueue();
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
   if(!livePoll)livePoll=setInterval(()=>livePull(id),400);
   liveQueue();
  }catch(e){liveMarkFailure(id);if(!liveReconnectTimer)liveReconnect(id)}
 },delay);
}
async function livePull(id){
 if(livePullBusy||!cur||cur.id!==id||members.length<2)return;
 livePullBusy=true;
 try{
  const r=await api('/books/'+id+'/live?since='+liveCursor);
  if(!r.state||!cur||cur.id!==id)return;
  liveCursor=r.updatedAt;
  if(r.clientId===liveClientId)return;
  liveApplying=true;
  const d=r.state;
  // Load any newly shared images before swapping the object list.
  await Promise.all(Object.entries(d.imgs||{}).map(([key,src])=>{
   if(imgs[key]&&imgs[key].src===src)return Promise.resolve();
   return new Promise(resolve=>{const im=new Image();im.onload=im.onerror=()=>{imgs[key]=im;resolve()};im.src=src});
  }));
  if(!cur||cur.id!==id){liveApplying=false;return}
  objs=Array.isArray(d.objs)?d.objs:[];
  bg=d.bg||'#ffffff';$('#bg').value=bg;pgSw();
  live=d.live||null;
  nid=Math.max(d.nid||1,...objs.map(o=>o.id||0))+1;
  sel=null;layers();render();
  liveApplying=false;liveFailures=0;
 }catch(e){liveApplying=false;liveMarkFailure(id)}
 finally{livePullBusy=false}
}
function liveQueue(){
 if(liveApplying||!cur||members.length<2||cur.id!==liveLastBook)return;
 clearTimeout(livePushTimer);
 livePushTimer=setTimeout(async()=>{
  if(liveApplying||!cur||members.length<2||cur.id!==liveLastBook)return;
  const state={objs:objs.map(o=>({...o,ed:0})),imgs:Object.fromEntries(Object.entries(imgs).map(([k,v])=>[k,v.src])),
   bg,nid,w:W,h:H0,scroll:SCR,car:car||undefined,live};
  let raw;try{raw=JSON.stringify(state)}catch(e){return}
  if(raw===liveLastSent)return;
  try{
   const r=await api('/books/'+cur.id+'/live',{method:'POST',body:{clientId:liveClientId,state}});
   liveLastSent=raw;liveCursor=Math.max(liveCursor,r.updatedAt||0);
  }catch(e){/* The ordinary Save path remains available if live sync is unavailable. */}
 },120);
}
