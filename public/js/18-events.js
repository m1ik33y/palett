/* Global click delegation for cards, nav and menus */
document.addEventListener('click',e=>{const T=e.target;
 if(!T.closest('#pop,#av'))$('#pop').hidden=1;if(!T.closest('#fmenu'))fmHide();if(!T.closest('#cmenu,[data-a=more]'))cmHide();if(!T.closest('#sech'))$('#sech').hidden=1;
 const th=T.closest('[data-th]');if(th){user.theme=th.dataset.th;theme();saveProfile();pop();pop();return}
 const nv=T.closest('[data-n]');if(nv){nv.dataset.n=='home'?go('home'):go('lib',nv.dataset.n);return}
 const nt=T.closest('[data-nt]');if(nt){const t=nt.dataset.nt;if(t=='import'){f2.click();return}S.mode=t;newView();return}
 const g=T.closest('[data-go]');if(g){go('lib',g.dataset.go);return}
 const a=T.closest('[data-a]'),c=T.closest('.card'),id=c&&c.dataset.id,m=books.find(b=>b.id==id);
 if(a){const k=a.dataset.a;
  if(k=='new')openNew('blank');else if(k=='imp'){openNew('blank');f2.click()}else if(k=='last'){const r=byUp()[0];r?open(r.id):openNew('blank')}
  else if(k=='more'){cmShow(a,id)}
  return}
 if(c&&!T.closest('[contenteditable=true]'))open(id)});
