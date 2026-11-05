/* View switching */
function go(v,t){if(v=='arch'&&!archOpen)return;const inLib=document.body.classList.contains('lib')||document.body.classList.contains('arch');if(v!='studio'&&v!='arch'&&!(v=='lib'&&inLib)&&books.some(b=>b.arch))lockArch();if(v!='studio'&&document.body.classList.contains('studio')){cur=null;if(typeof liveStop==='function')liveStop();members=[];memberBook=null}
 if(t)tab=t;window.mfClose&&mfClose();document.body.className=v;$('#pop').hidden=1;
 document.querySelectorAll('.nv').forEach(n=>n.classList.toggle('on',(v=='home'&&n.dataset.n=='home')||(v=='lib'&&n.dataset.n==tab)));render_();if(v=='set')settingsPage()}
