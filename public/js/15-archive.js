/* Archive password prompt: the password is verified by the server, ok(pass) gets the 7 s entry pass */
function archPrompt(ok){modal(mhead('Archive password')+`<div class="fld2"><div class="pwf"><input id="apw" type="password" placeholder="Password" autocomplete="off"><button type="button" id="apeye" title="Show password">${ic('eye',20)}</button></div></div><div class="aerr" id="apwe"></div><button class="pri" id="apc" style="width:100%;justify-content:center;padding:11px">Continue</button>`,'sm');
 const err=m=>{$('#apwe').textContent=m};
  const go1=async()=>{const v=$('#apw').value;if(!v)return err('Password not found');
   let r;try{r=await api('/archive/verify',{method:'POST',body:{password:v,create:true}})}catch(e){return err(e.status==401?'Password not found':(e.message||'Something went wrong'))}
   mclose();ok(r.pass)};
 $('#apeye').onclick=()=>{const i=$('#apw'),show=i.type=='password';i.type=show?'text':'password';$('#apeye').innerHTML=ic(show?'eyeoff':'eye',20);$('#apeye').title=show?'Hide password':'Show password';i.focus()};
 $('#apc').onclick=go1;$('#apw').onkeydown=e=>{if(e.key=='Enter')go1()};setTimeout(()=>$('#apw').focus(),30)}
/* Archived Folder: shown as a folder tile on the page once the password has been entered in the search box */
const FOLDER_SVG='<svg viewBox="0 0 64 64" aria-hidden="true"><path d="M5 15a4 4 0 0 1 4-4h14l6 6h26a4 4 0 0 1 4 4v8H5z" fill="#e0541c"/><rect x="3" y="22" width="58" height="35" rx="5" fill="#fe713b"/><rect x="3" y="22" width="58" height="6" rx="3" fill="#fff" opacity=".18"/></svg>';
function archTile(){if(!archOpen)return'';
 return`<div class="fgrid"><div class="afold" id="afold" tabindex="0" role="button" aria-label="Open Archived Folder">${FOLDER_SVG}<b>Archived Folder</b></div></div>`}
function archPage(){const l=[...books].filter(b=>b.arch).sort((a,b)=>b.updated-a.updated);
 $('#v-arch').innerHTML=`<div class="ahead"><button class="btn2" id="archback" title="Back to home (Esc)">${ic('back',20)}Back</button><h1><span class="afi">${FOLDER_SVG}</span>Archived Folder<span class="acnt">(${l.length})</span></h1></div><div style="height:16px"></div>${grid(l,'Nothing archived yet.')}`;
 $('#archback').onclick=closeArch}
/* Close the folder: lock it on the server, clear the search and go back to Home */
function closeArch(){const q=$('#q');q.value='';qv='';go('home')}
/* The 7s unlock token ran out while the folder was open */
function archExpire(){const q=$('#q');q.value='';qv='';lockArch();if(!document.body.classList.contains('home'))go('home');else render_()}
function archKeys(e){if(e.key!='Escape')return;
 if(!$('#mdl').hidden||!$('#dlg').hidden)return;
 const t=e.target;if(t&&(t.isContentEditable||(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)&&t.id!='q')))return;
 const c=document.body.classList;if(c.contains('studio'))return;
 if(archOpen||c.contains('arch')){e.preventDefault();closeArch()}}
addEventListener('keydown',archKeys,true);
addEventListener('keydown',e=>{if((e.key=='Enter'||e.key==' ')&&e.target&&e.target.id=='afold'){e.preventDefault();go('arch')}});
$('#q').addEventListener('keydown',async e=>{if(e.key!='Enter')return;const v=e.target.value;if(!v)return;let r;try{r=await api('/archive/verify',{method:'POST',body:{password:v}})}catch(e2){return}try{await unlockArch(r.pass)}catch(e3){toast(e3.message||'Could not open the archive');return}/* if the same text also matches normal paintbooks, keep the search so they stay listed next to the folder */
 if(!vis().some(match)){e.target.value='';qv=''}e.target.blur();render_()});
addEventListener('pagehide',()=>{if(archOpen)try{navigator.sendBeacon('/api/archive/lock')}catch(e){}});
