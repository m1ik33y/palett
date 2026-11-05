/* Property panel, layers, undo/redo, image import, export, keyboard shortcuts */
const map={color:o=>o.c=st.color,fill:o=>o.fc=st.fill,dofill:o=>o.df=st.doFill,op:o=>o.op=st.op,
 size:o=>o.t=='text'?o.fs=st.size*3:o.s=st.size,brush:o=>{if(o.t=='stroke'&&o.br!='eraser')o.br=st.brush},
 font:o=>{if(o.t=='text')o.f=st.font},bold:o=>{if(o.t=='text')o.b=st.bold},italic:o=>{if(o.t=='text')o.i=st.italic}};
function readUI(){st.color=$('#color').value;st.fill=$('#fill').value;st.doFill=$('#dofill').checked;st.size=+$('#size').value;st.op=$('#op').value/100;
 st.brush=$('#brush').value;st.font=$('#font').value;$('#bold').classList.toggle('on',st.bold);$('#italic').classList.toggle('on',st.italic);colMark();brushMark();skUpd()}
function syncUI(){if(!sel)return;$('#color').value=sel.c;$('#fill').value=sel.fc;$('#dofill').checked=!!sel.df;$('#op').value=sel.op*100;
 $('#size').value=sel.t=='text'?Math.round(sel.fs/3):sel.s;if(sel.t=='text'){$('#font').value=sel.f;st.bold=!!sel.b;st.italic=!!sel.i}
 if(sel.t=='stroke'&&sel.br!='eraser')$('#brush').value=sel.br;readUI()}
['color','fill','dofill','size','op','brush','font'].forEach(id=>{const el=$('#'+id);
 el.addEventListener('input',()=>{readUI();apply(id)});el.addEventListener('change',()=>pend=0)});
['bold','italic'].forEach(id=>$('#'+id).onclick=()=>{st[id]=!st[id];readUI();apply(id)});
function apply(id){if(!sel||(tool!='select'&&!sel.ed))return;if(!pend){snap();pend=1}map[id](sel);if(sel.t=='text')fit(sel);render();layers()}
$('#bg').oninput=e=>{bg=e.target.value;pgSw();render()};
function pgSw(){$('#pgs').style.background=bg}
function grip(d){d.onpointerdown=e=>{if(e.button||e.target.closest('button')||(e.pointerType=='touch'&&!e.target.closest('.gp')))return;
 const L=$('#layers'),rows=[...L.querySelectorAll('.ly')],n=rows.length,di=rows.indexOf(d),mid=rows.map(x=>x.offsetTop+x.offsetHeight/2),sy=e.clientY,sc0=L.scrollTop,line=document.createElement('div');line.className='dl';let on=0,p=di;
 d.setPointerCapture(e.pointerId);
 const show=()=>{line.style.top=(p<n?rows[p].offsetTop-2:rows[n-1].offsetTop+rows[n-1].offsetHeight)+'px'};
 d.onpointermove=ev=>{const dy=ev.clientY-sy;if(!on){if(Math.abs(dy)<5)return;on=1;d._m=1;L.append(line);d.classList.add('dragging')}
  const r=L.getBoundingClientRect();if(ev.clientY<r.top+24)L.scrollTop-=8;else if(ev.clientY>r.bottom-24)L.scrollTop+=8;
  d.style.transform='translateY('+(dy+L.scrollTop-sc0)+'px)';
  const y=ev.clientY-r.top+L.scrollTop;p=0;while(p<n&&y>mid[p])p++;show()};
 d.onpointerup=d.onpointercancel=()=>{d.onpointermove=d.onpointerup=d.onpointercancel=null;if(!on)return;line.remove();d.classList.remove('dragging');d.style.transform='';
  const disp=[...objs].reverse(),mv=disp[di],rest=disp.filter(x=>x!==mv);rest.splice(p>di?p-1:p,0,mv);
  if(rest.some((x,i)=>x!==disp[i])){snap();objs=rest.reverse()}layers();render()}}}
function layers(){const L=$('#layers');L.innerHTML='';[...objs].reverse().forEach(o=>{const d=document.createElement('div');d.className='ly'+(o===sel?' on':'');
 d.innerHTML='<span class="gp" title="Drag to reorder">'+ic('grip',16)+'</span><span class="n"></span><button data-a="eye" title="Show / hide">'+ic(o.hide?'eyeoff':'eye',16)+'</button><button data-a="up" title="Move up">'+ic('up',16)+'</button><button data-a="dn" title="Move down">'+ic('down',16)+'</button><button data-a="x" title="Delete">'+ic('x',16)+'</button>';
 d.querySelector('.n').textContent=nm(o);grip(d);
 d.onclick=e=>{if(d._m){d._m=0;return}const a=(e.target.closest('[data-a]')||{dataset:{}}).dataset.a,i=objs.indexOf(o);
  if(a){snap();if(a=='eye')o.hide=o.hide?0:1;if(a=='up'&&i<objs.length-1)[objs[i],objs[i+1]]=[objs[i+1],objs[i]];
   if(a=='dn'&&i>0)[objs[i],objs[i-1]]=[objs[i-1],objs[i]];if(a=='x'){objs.splice(i,1);if(sel===o)sel=null}}
  else{sel=o;tool='select';setTool('select');sel=o;syncUI()}
  layers();render()};L.append(d)})}
function undo(){if(!hist.length)return;redo.push(JSON.stringify(objs));objs=JSON.parse(hist.pop());sel=null;layers();render()}
function redoF(){if(!redo.length)return;hist.push(JSON.stringify(objs));objs=JSON.parse(redo.pop());sel=null;layers();render()}
function dup(){if(!sel)return;snap();const o=JSON.parse(JSON.stringify(sel));o.x+=20;o.y+=20;add(o)}
function del(){if(!sel)return;snap();objs=objs.filter(o=>o!==sel);sel=null;layers();render()}
$('#undo').onclick=undo;$('#redo').onclick=redoF;$('#dup').onclick=dup;$('#del').onclick=del;
$('#clr').onclick=()=>{snap();objs=[];sel=null;layers();render()};$('#fit').onclick=fitView;
$('#pan').onclick=()=>{if(!$('#side').hidden&&!$('#pnl').hidden){$('#side').hidden=true;$('#pan').classList.remove('on');$('#lay2').classList.remove('on');fitView()}else showPanel('paint')};
$('#lay2').onclick=()=>$('#lyr').click();
$('#zoom').title='Reset to 100%';$('#zoom').onclick=()=>{const r=stage.getBoundingClientRect(),k=1/view.s;view.x=r.width/2-(r.width/2-view.x)*k;view.y=r.height/2-(r.height/2-view.y)*k;view.s=1;fitMode=0;render()};
$('#full').onclick=()=>{try{document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen()}catch(e){}};
addEventListener('fullscreenchange',()=>setTimeout(fitView,100));
document.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{const t=b.dataset.t;
 if(t=='text'&&tool=='text'){const p=$('#tpop');if(!p.hidden){p.hidden=true;return}p.hidden=false;const r=b.getBoundingClientRect();p.style.left=Math.max(10,Math.min(innerWidth-p.offsetWidth-10,r.left))+'px';p.style.top=(PH.matches?Math.max(8,r.top-p.offsetHeight-8):r.bottom+8)+'px'}else setTool(t)});
document.addEventListener('click',e=>{if(!e.target.closest('#tpop,[data-t=text]'))$('#tpop').hidden=true});
addEventListener('keydown',e=>{if(e.key=='Escape')$('#tpop').hidden=true});
/* Image attachments are uploaded to the storage bucket; the canvas only keeps a short URL, so
   collaborators receive it through live sync instantly. Falls back to embedding if storage is unavailable. */
function addImg(src,fill,file){if(!cur)return;const book=cur.id;
 (async()=>{let blob=file,im=null;
  if(!blob&&typeof src=='string'&&src.startsWith('data:')){try{blob=await(await fetch(src)).blob()}catch(e){}}
  if(blob){toast('Uploading image…');
   try{const up=await fitImg(blob,3200);im=await fileImg(up);const r=await upMedia(up,'kind=book&book='+book);im._u=r.url;$('#toast').classList.remove('on')}
   catch(e){toast('Image stored inside the canvas ('+(e.message||'upload failed')+')');im=null}}
  if(!im){const s2=blob?await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.onerror=()=>r(null);fr.readAsDataURL(blob)}):src;
   if(!s2)return;im=await new Promise(r=>{const x=new Image();x.onload=()=>r(x);x.onerror=()=>r(null);x.src=s2});if(!im)return}
  if(!cur||cur.id!==book)return;
  const id='i'+nid++;imgs[id]=im;
  if(fill){snap();setTool('select');add(mk({t:'img',img:id,w:W,h:H,x:0,y:0}));return}
  const k=Math.min(1,W*.6/im.width,H*.6/im.height);
  snap();setTool('select');add(mk({t:'img',img:id,w:im.width*k,h:im.height*k,x:(W-im.width*k)/2,y:(H-im.height*k)/2}))})()}
function readF(f){if(!f||!f.type.startsWith('image/'))return;addImg(null,0,f)}
$('#imp').onclick=()=>$('#file').click();$('#file').onchange=e=>{[...e.target.files].forEach(readF);e.target.value=''};
addEventListener('dragover',e=>e.preventDefault());addEventListener('drop',e=>{e.preventDefault();[...e.dataTransfer.files].forEach(readF)});
addEventListener('paste',e=>[...(e.clipboardData?.files||[])].forEach(readF));
const bottom=()=>objs.reduce((m,o)=>o.hide?m:Math.max(m,o.y+o.h+(o.t=='stroke'?o.s:0)),0);
function snapshot(sx,sy,sw,sh,ow,oh){const L=document.createElement('canvas');L.width=ow;L.height=oh;const x=L.getContext('2d');x.setTransform(ow/sw,0,0,oh/sh,-sx*ow/sw,-sy*oh/sh);objs.forEach(o=>draw(x,o));
 const F=document.createElement('canvas');F.width=ow;F.height=oh;const f=F.getContext('2d');f.fillStyle=bg;f.fillRect(0,0,ow,oh);f.drawImage(L,0,0);return F}
function exBox(){let x0=0,y0=0,x1=W,y1=SCR?Math.max(H0,Math.ceil(bottom()+40)):H;
 if(!SCR)objs.forEach(o=>{if(o.hide||o.br=='eraser')return;const p=o.t=='stroke'?o.s*1.5:0;x0=Math.min(x0,o.x-p);y0=Math.min(y0,o.y-p);x1=Math.max(x1,o.x+o.w+p);y1=Math.max(y1,o.y+o.h+p)});
 return{x:Math.floor(x0),y:Math.floor(y0),w:Math.ceil(x1-x0),h:Math.ceil(y1-y0)}}
$('#exp').onclick=()=>{const B=exBox(),k=Math.min(SCR?1:Q,16000/B.h,16000/B.w,Math.sqrt(1.2e8/(B.w*B.h)));
 const c=snapshot(B.x,B.y,B.w,B.h,Math.round(B.w*k),Math.round(B.h*k));
 c.toBlob(b=>{if(!b){toast('Canvas is too large to export');return}
  if(window.PalettApp&&PalettApp.saveFile){const nm=((cur&&cur.name||'painting').replace(/[\\/:*?"<>|]+/g,'').trim()||'painting')+'.png',fr=new FileReader();fr.onload=()=>{let ok=false;try{ok=PalettApp.saveFile(nm,'image/png',String(fr.result).split(',')[1])}catch(e){}if(!ok)toast('Could not save the image')};fr.readAsDataURL(b);return}
  const a=document.createElement('a');a.href=URL.createObjectURL(b);
  a.download=((cur&&cur.name||'painting').replace(/[\\/:*?"<>|]+/g,'').trim()||'painting')+'.png';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000)})};
addEventListener('keydown',e=>{if(!document.body.classList.contains('studio'))return;if(/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&e.target.type!='range'&&e.target.type!='checkbox')return;
 const k=e.key.toLowerCase(),m=e.ctrlKey||e.metaKey;
 if(m&&k=='s'){e.preventDefault();saveNow(1);return}if(k==' '){spc=1;e.preventDefault();return}
 if(m&&k=='z'){e.preventDefault();e.shiftKey?redoF():undo();return}if(m&&k=='y'){e.preventDefault();redoF();return}if(m&&k=='d'){e.preventDefault();dup();return}
 if(k=='delete'||k=='backspace'){del();return}if(k=='escape'){sel=null;layers();render();return}
 if(sel&&k.startsWith('arrow')){e.preventDefault();const s=e.shiftKey?10:1;if(!pend){snap()}sel.x+=k=='arrowright'?s:k=='arrowleft'?-s:0;sel.y+=k=='arrowdown'?s:k=='arrowup'?-s:0;render();return}
 if(!m&&(k=='['||k==']')){const el=$('#size');el.value=Math.max(1,Math.min(80,+el.value+(k==']'?2:-2)));el.dispatchEvent(new Event('input'));return}const SK={r:'rect',o:'ell',l:'line'};if(!m&&SK[k]){pickShape(SK[k]);return}const T={v:'select',h:'hand',b:'brush',e:'eraser',t:'text',g:'fill'};if(!m&&T[k])setTool(T[k])});
addEventListener('keyup',e=>{if(e.key==' ')spc=0});
addEventListener('resize',render);
/* initial readUI()/setTool() run at the top of 22-init.js: colMark/brushMark/skUpd live in later scripts */
