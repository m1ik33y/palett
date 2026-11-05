/* Explorer tree in the sidebar */
let fopen=false,fren=null,fmid=null;
const fmHide=()=>{$('#fmenu').hidden=1;document.querySelectorAll('.fr.mo').forEach(e=>e.classList.remove('mo'))};
function fmShow(r,id,x){const fm=$('#fmenu'),m=books.find(b=>b.id==id);if(!fm.hidden&&fmid==id){fmHide();return}fmHide();fmid=id;r.classList.add('mo');
 fm.innerHTML=(PH.matches&&m?`<div class="sh">${esc(m.name)}</div>`:'')+(m&&m.shared?`<button data-mx="ar">${ic('archive',16)}Archive</button><button data-mx="lv" class="dng">${ic('logout',16)}Leave paintbook</button>`:`<button data-mx="rn">${ic('edit',16)}Rename</button><button data-mx="ar">${ic('archive',16)}Archive</button><button data-mx="dl" class="dng">${ic('trash',16)}Delete</button>`);fm.hidden=0;
 if(PH.matches||!x){fm.style.top=fm.style.left='';return}
 const b=x.getBoundingClientRect();fm.style.top=Math.min(b.bottom+4,innerHeight-100)+'px';fm.style.left=Math.max(8,b.right-150)+'px'}
$('#fmenu').onclick=e=>{const b=e.target.closest('[data-mx]');if(!b)return;const id=fmid;fmHide();
 if(b.dataset.mx=='lv'){const m=books.find(x=>x.id==id);if(m)leaveBook(m)}else if(b.dataset.mx=='rn'){fren=id;ftRender()}else if(b.dataset.mx=='ar'){const m=books.find(x=>x.id==id);if(m)archPrompt(()=>archiveBook(m))}else{const m=books.find(x=>x.id==id);if(!m)return;delBook(m)}};
const fsave=()=>patchMe({treeOpen:fopen?1:0});
function ftRender(){ftFill($('#ftl'));ftFill($('#mftl'))}
function ftFill(box){if(!box)return;
 const l=[...vis()].sort((a,b)=>a.name.localeCompare(b.name,undefined,{numeric:true}));
 box.innerHTML=l.length?l.map(b=>fren==b.id?`<div class="fr" style="padding-left:4px">${ic('file',16)}<input class="fi" maxlength="40" spellcheck="false" value="${esc(b.name)}"></div>`:`<div class="fr" data-fid="${b.id}" style="padding-left:4px">${ic('file',16)}<span class="fn">${esc(b.name)}</span><span class="fa"><button data-fx="mn" title="More">${ic('dots',18)}</button></span></div>`).join(''):'<div class="fe">No paintbooks yet. Use the + icon above.</div>';
 const i=box.querySelector('.fi');if(i){let done=0;const fin=ok=>{if(done)return;done=1;const m=books.find(b=>b.id==fren),v=i.value.trim();fren=null;if(ok&&v&&m){m.name=v;patchBook(m,{name:m.name});render_()}else ftRender()};i.onkeydown=e=>{if(e.key=='Enter')fin(1);else if(e.key=='Escape')fin(0);e.stopPropagation()};i.onblur=()=>fin(1);if(i.offsetParent){i.focus();i.select()}}}
const ftClick=e=>{const x=e.target.closest('[data-fx]'),r=e.target.closest('[data-fid]'),id=r&&r.dataset.fid;
 if(x){e.stopPropagation();const k=x.dataset.fx;
  if(k=='nf')openNew('blank');
  else if(k=='mn')fmShow(r,id,x);else if(k=='x')mfClose()
  return}
 if(r&&!e.target.closest('input')){open(id);window.mfClose&&mfClose()}};
$('#ft').addEventListener('click',ftClick);$('#mfs').addEventListener('click',ftClick);
const ftDbl=e=>{const r=e.target.closest('[data-fid]');if(r&&!e.target.closest('[data-fx]')){e.stopPropagation();const m=books.find(b=>b.id==r.dataset.fid);if(m&&m.shared)return;fren=r.dataset.fid;ftRender()}};
$('#ft').addEventListener('dblclick',ftDbl);$('#mfs').addEventListener('dblclick',ftDbl);
$('#fb').onclick=()=>{fopen=!fopen;$('#ft').hidden=!fopen;$('#fb').classList.toggle('fo',fopen);fsave()};
$('#ft').hidden=!fopen;$('#fb').classList.toggle('fo',fopen);ftRender();
