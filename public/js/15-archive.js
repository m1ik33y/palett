/* Archived folder: the archive password is verified by the server */
function archPrompt(ok){modal(mhead('Archive password')+`<div class="fld2"><div class="pwf"><input id="apw" type="password" placeholder="Password" autocomplete="off"><button type="button" id="apeye" title="Show password">${ic('eye',20)}</button></div></div><div class="aerr" id="apwe"></div><button class="pri" id="apc" style="width:100%;justify-content:center;padding:11px">Continue</button>`,'sm');
 const err=m=>{$('#apwe').textContent=m};
  let busy=0;const go1=async()=>{if(busy)return;const v=$('#apw').value;if(!v)return err('Password not found');busy=1;
   try{await api('/archive/verify',{method:'POST',body:{password:v,create:true}})}catch(e){busy=0;return err(e.status==401?'Password not found':(e.message||'Something went wrong'))}
   mclose();ok()};
 $('#apeye').onclick=()=>{const i=$('#apw'),show=i.type=='password';i.type=show?'text':'password';$('#apeye').innerHTML=ic(show?'eyeoff':'eye',20);$('#apeye').title=show?'Hide password':'Show password';i.focus()};
 $('#apc').onclick=go1;$('#apw').onkeydown=e=>{if(e.key=='Enter')go1()};setTimeout(()=>$('#apw').focus(),30)}
/* Orange file-explorer style folder, used on the card and in the folder header */
const FOLDER_SVG='<svg viewBox="0 0 64 52" aria-hidden="true"><path d="M4 8a4 4 0 0 1 4-4h14.2a4 4 0 0 1 2.9 1.2l3 3.1a4 4 0 0 0 2.9 1.2H56a4 4 0 0 1 4 4v30.5a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" fill="#f2761a"/><path d="M4 19a4 4 0 0 1 4-4h48a4 4 0 0 1 4 4v25a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4Z" fill="#ffa23f"/><path d="M8 15h48a4 4 0 0 1 4 4v1.5H4V19a4 4 0 0 1 4-4Z" fill="#ffc27a" opacity=".55"/></svg>';
const archCount=()=>books.filter(b=>b.arch).length,archLbl=n=>n+' archived file'+(n==1?'':'s');
/* The folder card that appears in the library once the right password was entered in the search bar */
const archFolderCard=()=>`<div class="fcard" data-arch-open role="button" tabindex="0" aria-label="Open Archived folder"><div class="fth">${FOLDER_SVG}</div><div class="meta"><div class="nm"><b>Archived folder</b><small>${archLbl(archCount())}</small></div></div></div>`;
/* The folder itself (body class "arch", section #v-arch) */
function archView(){const l=[...books].filter(b=>b.arch).sort((a,b)=>b.updated-a.updated);
 $('#v-arch').innerHTML=`<div class="ah"><button class="ib ab" id="archbk" aria-label="Back to paintbooks" title="Back">${ic('back',22)}</button><span class="afi">${FOLDER_SVG}</span><div class="at"><h1>Archived folder</h1><small class="mut">${archLbl(l.length)}</small></div><button class="btn2 alk" id="archlk" title="Lock the Archived folder">${ic('lock',17)}<span>Lock</span></button></div>${grid(l,'Nothing archived yet.<br>Archive a paintbook from the Folder explorer menu.')}`}
$('#v-arch').addEventListener('click',e=>{
 if(e.target.closest('#archbk'))go('lib','all');
 else if(e.target.closest('#archlk')){lockArch();go('home')}});
document.addEventListener('click',e=>{if(e.target.closest('[data-arch-open]'))go('arch')});
document.addEventListener('keydown',e=>{if((e.key=='Enter'||e.key==' ')&&e.target.matches&&e.target.matches('[data-arch-open]')){e.preventDefault();go('arch')}});
/* Typing the archive password into the search bar and pressing Enter unlocks it; the folder card then appears in the grid */
$('#q').addEventListener('keydown',async e=>{if(e.key!='Enter')return;const v=e.target.value;if(!v)return;try{await api('/archive/verify',{method:'POST',body:{password:v}})}catch(e2){return}try{await unlockArch()}catch(e3){toast(e3.message||'Could not open the archive');return}e.target.value='';qv='';e.target.blur();render_();toast('Folder unlocked')});
