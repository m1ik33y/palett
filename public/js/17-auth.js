/* Sign up / log in against the API */
async function loadBooks(){try{books=(await api('/books')).books}catch(e){books=[];toast(e.message||'Could not load paintbooks')}}
async function startSession(u){
  if(lastUid&&lastUid!==u.id){cur=null;go('home')}
  archOpen=false;lastUid=u.id;me=u;user.name=u.name;user.theme=u.theme||'dark';
  fopen=!!u.treeOpen;$('#ft').hidden=!fopen;$('#fb').classList.toggle('fo',fopen);
  theme();avatar();await loadBooks();render_();$('#auth').hidden=1}
function sessionExpired(){if(!$('#auth').hidden)return;me=null;showAuth('in');$('#aerr').textContent='Your session expired. Please log in again.'}
function showAuth(mode){const A=$('#auth'),up=mode=='up';A.hidden=0;
 A.innerHTML=`<div class="ac"><div class="ab">${LOGO}<span>Palett</span></div><div class="mut">${up?'Create an account to get started.':'Welcome back. Log in to continue.'}</div>
<div class="seg2"><button data-am="in" class="${up?'':'on'}">Log in</button><button data-am="up" class="${up?'on':''}">Sign up</button></div>
${up?`<div class="fld2"><span>Name</span><input id="an" placeholder="Your name" maxlength="24" autocomplete="name"></div>`:''}
<div class="fld2"><span>Email</span><input id="ae" type="email" placeholder="you@example.com" autocomplete="email"></div>
<div class="fld2"><span>Password</span><input id="ap" type="password" placeholder="${up?'At least 6 characters':'Your password'}" autocomplete="${up?'new-password':'current-password'}"></div>
${up?`<div class="tbx legal">${legal('Terms of Service',TOS)}${legal('Privacy Policy',PRIV)}</div><label class="agr"><input type="checkbox" id="atc"><span>I have read and agree to the <a data-lg="tos">Terms of Service</a> and <a data-lg="pp">Privacy Policy</a>.</span></label>`:''}
<div class="aerr" id="aerr"></div><button class="pri" id="ago" ${up?'disabled':''}>${up?'Create account':'Log in'}</button></div>`;
 A.querySelectorAll('[data-am]').forEach(b=>b.onclick=()=>showAuth(b.dataset.am));
 A.querySelectorAll('[data-lg]').forEach(b=>b.onclick=()=>modal(mhead(b.dataset.lg=='pp'?'Privacy Policy':'Terms of Service')+`<div class="legal">${b.dataset.lg=='pp'?legal('Privacy Policy',PRIV):legal('Terms of Service',TOS)}</div>`));
 const err=m=>{$('#aerr').textContent=m};
 if(up)$('#atc').onchange=e=>{$('#ago').disabled=!e.target.checked};
  const go1=async()=>{const em=$('#ae').value.trim().toLowerCase(),pw=$('#ap').value,btn=$('#ago');err('');
   if(!/^\S+@\S+\.\S+$/.test(em))return err('Enter a valid email address.');
   try{let r;
    if(up){const n=$('#an').value.trim();if(!n)return err('Enter your name.');if(pw.length<6)return err('Password must be at least 6 characters.');if(!$('#atc').checked)return err('Please accept the Terms of Service and Privacy Policy.');
     btn.disabled=true;r=await api('/auth/signup',{method:'POST',body:{name:n,email:em,password:pw,agreed:true}})}
    else{btn.disabled=true;r=await api('/auth/login',{method:'POST',body:{email:em,password:pw}})}
    await startSession(r.user)}
   catch(e){err(e.message||'Something went wrong.');btn.disabled=up&&!$('#atc').checked}};
 $('#ago').onclick=go1;A.querySelectorAll('input').forEach(i=>i.onkeydown=e=>{if(e.key=='Enter'&&!(up&&!$('#atc').checked))go1()});
 setTimeout(()=>(up?$('#an'):$('#ae')).focus(),30)}
