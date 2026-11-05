/* "Create paintbook" flow */
/* ===== New paintbook ===== */
const PRE=[['hd','HD',1920,1080,'Landscape 16:9'],['sq','Square',1080,1080,'Social 1:1'],['pt','Portrait',1080,1350,'Social 4:5'],['st','Story',1080,1920,'Vertical 9:16'],['a4','A4',2480,3508,'Print, 300 dpi'],['bn','Banner',1500,500,'Header 3:1'],['uhd','4K',3840,2160,'Ultra HD']];
const S={},cl=v=>Math.min(8000,Math.max(64,Math.round(+v)||64));
const bxs=(w,h)=>{const k=46/Math.max(w,h);return`<span class="pv"><span class="bx" style="width:${Math.max(8,w*k)}px;height:${Math.max(8,h*k)}px"></span></span>`};
const imgDims=()=>{const k=Math.min(1,4000/Math.max(S.iw,S.ih,1));return{w:cl(S.iw*k),h:cl(S.ih*k)}};
const nSize=()=>S.mode=='import'&&S.img?imgDims():S.mode=='scroll'?{w:cl(S.w),h:1080,scroll:1}:{w:cl(S.w),h:cl(S.h)};
const matchPre=()=>(PRE.find(p=>p[2]==S.w&&p[3]==S.h)||['custom'])[0];
const head=()=>`<div class="hd"><input id="nn" maxlength="60" placeholder="Untitled ${books.length+1}" value="${esc(S.name)}"><input id="tt" maxlength="80" placeholder="Add a title (optional)" value="${esc(S.title)}"></div>`;
const bgPick=()=>`<div class="fld"><span>Page colour</span><div class="bgs">${['#ffffff','#f5efe3','#cfe8ff','#ffe3ec','#2b2b2e','#000000'].map(c=>`<button class="sw" data-x="bg" data-v="${c}" style="background:${c}" title="${c}"></button>`).join('')}<input type="color" id="nbg" value="${S.bg}"></div></div>`;
const pSize=()=>{const sc2=S.mode=='scroll';return head()+`<div class="mut">${sc2?'Scroll canvas: the width follows the size you pick, the height never ends.':'Pick a canvas size, or enter your own.'}</div>
<div class="szg">${PRE.map(p=>`<button class="szc" data-x="pre" data-v="${p[0]}">${bxs(p[2],p[3])}<b>${p[1]}</b><small>${p[2]} × ${p[3]}</small><small>${p[4]}</small></button>`).join('')}<button class="szc" data-x="pre" data-v="custom"><span class="pv"><span class="bx dash" style="width:34px;height:34px"></span></span><b>Custom</b><small>Any size</small><small>64–8000 px</small></button></div>
<div class="dim"><label>Width<input type="number" id="cw" min="64" max="8000" inputmode="numeric"></label><span class="mut">×</span>${sc2?'<label>Height<input id="ch" value="Unlimited" disabled></label>':'<label>Height<input type="number" id="ch" min="64" max="8000" inputmode="numeric"></label><span class="mut">px</span><button class="ib" data-x="swap" title="Swap width and height">'+ic('swap',20)+'</button>'}</div>`+bgPick()};
const pImport=()=>{const z=imgDims();return head()+`<img class="pvimg" src="${S.img}" alt=""><div class="cen mut">${S.iw} × ${S.ih} px · canvas ${z.w} × ${z.h} px, same shape as your image</div><div class="cen"><button class="lnk" data-x="pick">Change image</button></div>`};
function sum(){const z=nSize(),n=S.name.trim()||'Untitled '+(books.length+1);
 $('#sn').textContent=n;$('#ss').textContent=S.mode=='scroll'?`Scroll · ${z.w} px wide · unlimited height`:S.mode=='import'?`Import · ${z.w} × ${z.h} px`:`Blank · ${z.w} × ${z.h} px`;
 $('#sic').innerHTML=ic(S.mode=='scroll'?'scroll':S.mode=='import'?'upload':'blank',22)}
function mark(){document.querySelectorAll('.sw').forEach(b=>b.classList.toggle('on',b.dataset.v==S.bg));document.querySelectorAll('.szc').forEach(b=>b.classList.toggle('on',b.dataset.v==S.pre));
 const a=document.activeElement;[['cw',S.w],['ch',S.h]].forEach(([id,v])=>{const e=$('#'+id);if(e&&a!=e&&!e.disabled)e.value=v});sum()}
function newView(){const el=$('#v-new');
 if(!$('#nbody'))el.innerHTML=`<div class="nwcol"><div class="nwseg seg2"><button class="nws" data-nt="blank">Blank</button><button class="nws" data-nt="import">Import</button><button class="nws" data-nt="scroll">Scroll</button></div><div id="nbody"></div><div class="nwfoot"><div class="sum"><i id="sic"></i><div><b id="sn"></b><small id="ss"></small></div></div><button class="pri cb" id="mk" data-x="mk">Create</button></div></div>`;
 $('#nbody').innerHTML=(S.mode=='import'&&S.img?pImport:pSize)();
 document.querySelectorAll('.nw,.nws').forEach(n=>n.classList.toggle('on',n.dataset.nt==S.mode));mark()}
function openNew(t){Object.assign(S,{mode:t,pre:'hd',w:1920,h:1080,name:'',title:'',bg:'#ffffff',img:null,iw:0,ih:0});$('#v-new').innerHTML='';go('new');newView()}
function loadImgFile(f){if(!f||!f.type.startsWith('image/')){toast('Please choose an image file');return}
 const r=new FileReader();r.onload=()=>{const im=new Image();im.onload=()=>{S.img=r.result;S.iw=im.naturalWidth||1000;S.ih=im.naturalHeight||1000;S.mode='import';newView()};im.onerror=()=>toast('That image could not be read');im.src=r.result};r.readAsDataURL(f)}
const vn=$('#v-new');
vn.addEventListener('click',e=>{const x=e.target.closest('[data-x]');if(!x)return;const k=x.dataset.x,v=x.dataset.v;
 if(k=='pre'){S.pre=v;const p=PRE.find(q=>q[0]==v);if(p){S.w=p[2];S.h=p[3]}else $('#cw').focus();mark()}
 else if(k=='bg'){S.bg=v;const n=$('#nbg');if(n)n.value=v;mark()}
 else if(k=='swap'){[S.w,S.h]=[S.h,S.w];S.pre=matchPre();mark()}
 else if(k=='pick')f2.click();
 else if(k=='mk'){const z=nSize();x.disabled=true;
  newBook({w:z.w,h:z.h,scroll:z.scroll,name:S.name,title:S.title,bg:S.bg,src:S.mode=='import'?S.img:null,fill:S.mode=='import'}).catch(()=>{x.disabled=false})}});
vn.addEventListener('input',e=>{const t=e.target,n=+t.value;
 if(t.id=='cw'||t.id=='ch'){if(n>0){S[t.id=='cw'?'w':'h']=n;S.pre=matchPre();mark()}}
 else if(t.id=='nn'){S.name=t.value;sum()}
 else if(t.id=='tt')S.title=t.value;else if(t.id=='nbg'){S.bg=t.value;mark()}});
vn.addEventListener('change',e=>{const t=e.target;
 if(t.id=='cw'||t.id=='ch'){const f=t.id=='cw'?'w':'h';S[f]=cl(t.value);t.value=S[f];mark()}});
vn.addEventListener('keydown',e=>{if(e.key=='Enter'&&e.target.id=='nn'){e.preventDefault();$('#mk').click()}});
