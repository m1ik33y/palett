/* Account menu + logout */
const acct=()=>me;
function pop(){const p=$('#pop');if(!p.hidden){p.hidden=1;return}const a=acct();
 const av=user.avatar;
 p.innerHTML=`<div class="pf">${a?`<button type="button" class="pfa pfe${av?' has-img':''}" id="pfe" title="Change profile picture" aria-label="Change profile picture"${av?` style="background-image:url('${esc(av)}')"`:''}>${av?'':esc((user.name.trim()[0]||'A').toUpperCase())}<i class="pfc">${ic('camera',22)}</i></button>`:`<span class="pfa">${esc((user.name.trim()[0]||'A').toUpperCase())}</span>`}<div class="pfn"><b>${esc(user.name)}</b><small>${a?'Signed in':'Guest'}</small></div></div>${a&&av?`<button data-pm="rmav">${ic('trash',18)}Remove photo</button>`:''}<hr>
<button data-pm="set">${ic('gear',18)}Settings</button><button data-pm="pp">${ic('shield',18)}Privacy Policy</button><button data-pm="tos">${ic('file',18)}Terms of Service</button><hr>
${a?`<button data-pm="out">${ic('logout',18)}Log out</button>`:`<button data-pm="in">${ic('user',18)}Log in / Sign up</button>`}`;p.hidden=0;
 const pe=$('#pfe');if(pe)pe.onclick=pickAvatar}
/* Profile picture: choose a file, crop to a square, upload to the bucket, show it everywhere. */
function pickAvatar(){if(!me)return;const f=$('#avf');f.value='';f.click()}
function applyAvatar(u){user.avatar=u.avatar||null;me=u;avatar();
 if(typeof members!=='undefined')members.forEach(m=>{if(m.id==u.id)m.avatar=user.avatar});const im=$('#invm');if(im&&typeof memberRow=='function')im.innerHTML=memberRow();
 if(document.body.classList.contains('set')&&typeof settingsPage=='function')settingsPage();
 if(!$('#pop').hidden&&!$('#pop .inv')){$('#pop').hidden=1;pop()}}
$('#avf').onchange=async e=>{const f=e.target.files[0];e.target.value='';if(!f)return;
 if(!f.type.startsWith('image/'))return toast('Please choose an image file.');
 try{toast('Uploading photo…');const b=await avatarBlob(f);const r=await upMedia(b,'kind=avatar');applyAvatar(r.user);toast('Profile picture updated')}
 catch(err){toast(err.message||'Could not update the picture')}};
async function removeAvatar(){try{const r=await upMedia(null,'kind=avatar','DELETE');applyAvatar(r.user);toast('Profile picture removed')}catch(err){toast(err.message||'Could not remove the picture')}}
$('#pop').addEventListener('click',e=>{const b=e.target.closest('[data-pm]');if(!b)return;$('#pop').hidden=1;const k=b.dataset.pm;
 if(k=='set')document.body.classList.contains('studio')?leave(()=>go('set')):go('set');else if(k=='pp')modal(mhead('Privacy Policy')+`<div class="legal">${legal('Privacy Policy',PRIV)}</div>`);else if(k=='tos')modal(mhead('Terms of Service')+`<div class="legal">${legal('Terms of Service',TOS)}</div>`);
 else if(k=='in')showAuth('in');else if(k=='out')logout();else if(k=='rmav')removeAvatar()});
function logout(){const go2=async()=>{try{await api('/auth/logout',{method:'POST'})}catch(e){}me=null;lastUid=null;books=[];archOpen=false;cur=null;user={name:'Artist',theme:user.theme,avatar:null};theme();avatar();go('home');showAuth('in')};document.body.classList.contains('studio')?leave(()=>{go('home');go2()}):go2()}
