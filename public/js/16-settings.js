/* Settings page */
const isDark=()=>user.theme=='dark'||(user.theme!='light'&&matchMedia('(prefers-color-scheme: dark)').matches);
function settingsPage(){const a=acct();
 $('#v-set').innerHTML=`<div class="setw"><h1>Settings</h1><div class="mut">Manage your profile, appearance and account.</div>
<div class="setc"><h3>Profile</h3><div class="sprof"><span class="pfa" id="spa">${esc((user.name.trim()[0]||'A').toUpperCase())}</span><label class="fld2"><span>Display name</span><input id="sn" value="${esc(user.name)}" maxlength="24" placeholder="Your name"></label></div>
<div class="srow" style="margin-top:8px"><div><b>Email</b><small>${a?esc(a.email):'Not signed in (guest)'}</small></div></div></div>
<div class="setc"><h3>Appearance</h3><div class="srow"><div><b>Dark mode</b><small>Switch between the dark and light look.</small></div><button class="tgl${isDark()?' on':''}" id="tgl" role="switch" aria-checked="${isDark()}" title="Toggle dark mode"><i></i></button></div></div>
<div class="setc"><h3>Storage</h3><div class="srow"><div><b>${vis().length} paintbook${vis().length==1?'':'s'}</b><small>Saved to your account</small></div></div></div>
<div class="setc"><h3>Legal</h3><div class="srow"><div><b>Privacy Policy</b></div><button class="btn2" data-sl="pp">View</button></div><div class="srow"><div><b>Terms of Service</b></div><button class="btn2" data-sl="tos">View</button></div></div>
<div class="setc"><h3>Account</h3><div class="srow"><div><b>${a?'Log out':'Log in or sign up'}</b><small>${a?'You can log back in any time.':'Create an account to save your paintbooks.'}</small></div><button class="btn2${a?' dng':''}" id="sacc">${a?'Log out':'Log in'}</button></div></div></div>`;
 $('#sn').oninput=e=>{user.name=e.target.value.trim()||'Artist';saveProfile();avatar();$('#spa').textContent=(user.name.trim()[0]||'A').toUpperCase()};
  $('#tgl').onclick=e=>{const b=e.currentTarget,on=!b.classList.contains('on');b.classList.toggle('on',on);b.setAttribute('aria-checked',on);user.theme=on?'dark':'light';theme();saveProfile()};
 document.querySelectorAll('[data-sl]').forEach(b=>b.onclick=()=>{const p=b.dataset.sl=='pp';modal(mhead(p?'Privacy Policy':'Terms of Service')+`<div class="legal">${p?legal('Privacy Policy',PRIV):legal('Terms of Service',TOS)}</div>`)});
 $('#sacc').onclick=()=>a?logout():showAuth('in')}
