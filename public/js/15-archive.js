/* Secret folder: the archive password is verified by the server */
function archPrompt(ok){modal(mhead('Archive password')+`<div class="fld2"><div class="pwf"><input id="apw" type="password" placeholder="Password" autocomplete="off"><button type="button" id="apeye" title="Show password">${ic('eye',20)}</button></div></div><div class="aerr" id="apwe"></div><button class="pri" id="apc" style="width:100%;justify-content:center;padding:11px">Continue</button>`,'sm');
 const err=m=>{$('#apwe').textContent=m};
  let busy=0;const go1=async()=>{if(busy)return;const v=$('#apw').value;if(!v)return err('Password not found');busy=1;
   try{await api('/archive/verify',{method:'POST',body:{password:v,create:true}})}catch(e){busy=0;return err(e.status==401?'Password not found':(e.message||'Something went wrong'))}
   mclose();ok()};
 $('#apeye').onclick=()=>{const i=$('#apw'),show=i.type=='password';i.type=show?'text':'password';$('#apeye').innerHTML=ic(show?'eyeoff':'eye',20);$('#apeye').title=show?'Hide password':'Show password';i.focus()};
 $('#apc').onclick=go1;$('#apw').onkeydown=e=>{if(e.key=='Enter')go1()};setTimeout(()=>$('#apw').focus(),30)}
function secret(){const l=[...books].filter(b=>b.arch).sort((a,b)=>b.updated-a.updated);
 $('#v-sec').innerHTML=`<div class="sech"><h1>${ic('lock',26)}Secret folder</h1><button class="btn2" id="seclk">Exit</button></div><div class="mut">Your archived paintbooks are kept here.</div><div style="height:18px"></div>${grid(l,'Nothing archived yet.')}`;$('#seclk').onclick=()=>{lockArch();go('home')}}
function showSecHit(){const n=books.filter(b=>b.arch).length,h=$('#sech'),r=$('#q').getBoundingClientRect();
 h.innerHTML=`<button id="secgo">${ic('lock',22)}<span><b>Secret folder</b><small>${n} archived file${n==1?'':'s'}</small></span></button>`;
 h.style.left=r.left+'px';h.style.top=(r.bottom+6)+'px';h.style.width=r.width+'px';h.hidden=0}
$('#sech').onclick=e=>{if(e.target.closest('#secgo')){$('#sech').hidden=1;go('sec')}};
$('#q').addEventListener('keydown',async e=>{if(e.key!='Enter')return;const v=e.target.value;if(!v)return;try{await api('/archive/verify',{method:'POST',body:{password:v}})}catch(e2){return}try{await unlockArch()}catch(e3){toast(e3.message||'Could not open the archive');return}e.target.value='';qv='';render_();showSecHit()});
