/* Global click delegation for cards, nav and menus */
document.addEventListener('click',e=>{const T=e.target;
 if(!T.closest('#pop,#av'))$('#pop').hidden=1;if(!T.closest('#fmenu'))fmHide();
 if(T.closest('#afold')){go('arch');return}
 const th=T.closest('[data-th]');if(th){user.theme=th.dataset.th;theme();saveProfile();pop();pop();return}
 const nv=T.closest('[data-n]');if(nv){nv.dataset.n=='home'?go('home'):go('lib',nv.dataset.n);return}
 const nt=T.closest('[data-nt]');if(nt){const t=nt.dataset.nt;if(t=='import'){f2.click();return}if(t=='carousel'&&S.mode!='carousel'){Object.assign(S,{mode:t,dir:'h',n:3,pre:'pt',w:1080,h:1350})}else if(t!='carousel'&&S.mode=='carousel'){Object.assign(S,{mode:t,pre:'hd',w:1920,h:1080})}S.mode=t;newView();return}
 const g=T.closest('[data-go]');if(g){go('lib',g.dataset.go);return}
 const a=T.closest('[data-a]'),c=T.closest('.card'),id=c&&c.dataset.id,m=books.find(b=>b.id==id);
 if(a){const k=a.dataset.a;
  if(k=='new')openNew('blank');else if(k=='imp'){openNew('blank');f2.click()}else if(k=='last'){const r=byUp()[0];r?open(r.id):openNew('blank')}
  else if(k=='fav'){m.fav=m.fav?0:1;patchBook(m,{fav:m.fav});render_()}else if(k=='dup')dupBook(id);
  else if(k=='unarch'){api('/books/'+m.id,{method:'PATCH',body:{arch:0}}).then(()=>{m.arch=0;render_()}).catch(e=>toast(e.message||'Could not unarchive'))}
  else if(k=='del')delBook(m)
   else if(k=='ren'){const b=c.querySelector('b');b.contentEditable=true;b.focus();getSelection().selectAllChildren(b);
   b.onkeydown=ev=>{if(ev.key=='Enter'){ev.preventDefault();b.blur()}};b.onblur=()=>{b.contentEditable=false;m.name=b.textContent.trim()||m.name;patchBook(m,{name:m.name});render_()}}
  return}
 if(c&&!T.closest('[contenteditable=true]'))open(id)});
