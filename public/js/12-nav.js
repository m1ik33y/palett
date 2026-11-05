/* View switching */
function go(v,t){if(v=='arch'&&!archOpen)return;if(archSolo&&v!='arch'&&v!='studio')qv='';if(v!='studio'&&v!='arch'&&books.some(b=>b.arch))lockArch();if(v!='studio'&&document.body.classList.contains('studio')){cur=null;if(typeof liveStop==='function')liveStop();members=[];memberBook=null}
 if(t)tab=t;window.mfClose&&mfClose();document.body.className=v;$('#pop').hidden=1;
 document.querySelectorAll('.nv').forEach(n=>n.classList.toggle('on',(v=='home'&&n.dataset.n=='home')||(v=='lib'&&n.dataset.n==tab)));render_();if(v=='set')settingsPage()}
