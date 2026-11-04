/* View switching */
function go(v,t){if(v=='arch'&&!archOpen)return;if(v!='studio'&&v!='arch'&&archOpen)lockArch();if(v!='studio'&&document.body.classList.contains('studio')){cur=null}
 if(t)tab=t;document.body.className=v;$('#pop').hidden=1;
 document.querySelectorAll('.nv').forEach(n=>n.classList.toggle('on',(v=='home'&&n.dataset.n=='home')||(v=='lib'&&n.dataset.n==tab)));render_();if(v=='set')settingsPage()}
