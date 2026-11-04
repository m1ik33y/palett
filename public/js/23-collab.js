/* Collaboration: invite people to the open paintbook by username */
let members=[],memberBook=null;
const PFC=['#fe713b','#5856d6','#00897b','#ff2d92','#1565c0','#8bc34a','#af52de','#ff9500'];
const pfcol=s=>{let h=0;for(const c of String(s))h=(h*31+c.charCodeAt(0))>>>0;return PFC[h%PFC.length]};
const pfp=m=>`<span class="cpf" style="background:${pfcol(m.id)}" title="${esc(m.name)}${m.username?' (@'+esc(m.username)+')':''}${m.owner?' (owner)':''}">${esc((m.name.trim()[0]||'A').toUpperCase())}</span>`;
async function loadMembers(){if(!cur)return;const id=cur.id;try{const r=await api('/books/'+id+'/members');if(cur&&cur.id==id){members=r.members;memberBook=id;cur.isOwner=r.isOwner}}catch(e){}}
/* Overlapping profile circles in the top-right corner of the paint page (everyone except me) */
function stackRender(){const s=$('#stk');if(!s)return;const o=members.filter(m=>!me||m.id!==me.id);
 s.hidden=!o.length;const shown=o.slice(0,4),more=o.length-shown.length;
 s.innerHTML=shown.map(pfp).join('')+(more>0?`<span class="cpf cmore">+${more}</span>`:'')}
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
   const r=await api('/books/'+cur.id+'/members',{method:'POST',body:{username:v}});members=r.members;memberBook=cur.id;stackRender();
   $('#invi').value='';$('#invm').innerHTML=memberRow();toast(members[members.length-1].name+' was added to the canvas')}
  catch(e){err(e.message||'Could not invite.')}
  b.disabled=false};
 $('#invb').onclick=send;$('#invi').onkeydown=e=>{if(e.key=='Enter')send()};
 loadMembers().then(()=>{stackRender();const m=$('#invm');if(m)m.innerHTML=memberRow()})}
$('#stk').onclick=()=>{if(cur)invitePop()};
