/* Account menu + logout */
const acct=()=>me;
function pop(){const p=$('#pop');if(!p.hidden){p.hidden=1;return}const a=acct();
 p.innerHTML=`<div class="pf"><span class="pfa">${esc((user.name.trim()[0]||'A').toUpperCase())}</span><div class="pfn"><b>${esc(user.name)}</b><small>${a?esc(a.email):'Guest'}</small></div></div><hr>
<button data-pm="set">${ic('gear',18)}Settings</button><button data-pm="pp">${ic('shield',18)}Privacy Policy</button><button data-pm="tos">${ic('file',18)}Terms of Service</button><hr>
${a?`<button data-pm="out">${ic('logout',18)}Log out</button>`:`<button data-pm="in">${ic('user',18)}Log in / Sign up</button>`}`;p.hidden=0}
$('#pop').addEventListener('click',e=>{const b=e.target.closest('[data-pm]');if(!b)return;$('#pop').hidden=1;const k=b.dataset.pm;
 if(k=='set')document.body.classList.contains('studio')?leave(()=>go('set')):go('set');else if(k=='pp')modal(mhead('Privacy Policy')+`<div class="legal">${legal('Privacy Policy',PRIV)}</div>`);else if(k=='tos')modal(mhead('Terms of Service')+`<div class="legal">${legal('Terms of Service',TOS)}</div>`);
 else if(k=='in')showAuth('in');else if(k=='out')logout()});
function logout(){const go2=async()=>{try{await api('/auth/logout',{method:'POST'})}catch(e){}me=null;lastUid=null;books=[];archOpen=false;cur=null;user={name:'Artist',theme:user.theme};theme();avatar();go('home');showAuth('in')};document.body.classList.contains('studio')?leave(()=>{go('home');go2()}):go2()}
