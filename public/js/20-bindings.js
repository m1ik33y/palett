/* Toolbar, menu and dashboard bindings */
$('#av').onclick=pop;$('#back').onclick=()=>leave(()=>go('home'));
$('#svb').onclick=()=>saveNow(1);
$('#sv').onclick=async()=>{const b=$('#sv');if(b.classList.contains('busy'))return;b.classList.add('busy');try{await saveNow(1)}finally{b.classList.remove('busy')}};
$('#bn').oninput=e=>{if(cur){cur.name=e.target.value||'Untitled';saveMeta(cur)}};
$('#fv').onclick=()=>{if(cur){cur.fav=cur.fav?0:1;$('#fv').classList.toggle('fav',!!cur.fav);patchBook(cur,{fav:cur.fav})}};
$('#q').oninput=e=>{$('#sech').hidden=1;qv=e.target.value;if(!document.body.classList.contains('lib'))go('lib',tab);else lib()};
const f2=document.createElement('input');f2.type='file';f2.accept='image/*';f2.id='f2';f2.hidden=true;document.body.append(f2);
f2.onchange=e=>{const f=e.target.files[0];e.target.value='';loadImgFile(f)};
addEventListener('beforeunload',e=>{if(isDirty()){e.preventDefault();e.returnValue=''}});
new ResizeObserver(()=>{if(document.body.classList.contains('studio'))fitMode?fitView():render(1)}).observe($('#wrap'));
function colMark(){document.querySelectorAll('.cs').forEach(b=>b.classList.toggle('on',b.dataset.c==st.color.toLowerCase()))}
function brushMark(){document.querySelectorAll('.bb[data-b]').forEach(b=>b.classList.toggle('on',b.dataset.b==st.brush))}
$('#side').addEventListener('click',e=>{const c=e.target.closest('.cs'),b=e.target.closest('[data-b]');
 if(c){$('#color').value=c.dataset.c;$('#color').dispatchEvent(new Event('input'))}
 if(b){$('#brush').value=b.dataset.b;$('#brush').dispatchEvent(new Event('input'));if(tool!='select')setTool('brush')}});
const shpIc=()=>$('#shp').innerHTML=ic('shapes');
function pickShape(k){st.shape=k;shpIc();setTool('shape');$('#shf').hidden=1}
$('#shf').innerHTML=SH.map(([k,n])=>`<button data-sh="${k}" title="${n}">${ic('sh_'+k,24)}</button>`).join('');
$('#shf').onclick=e=>{const b=e.target.closest('[data-sh]');if(b)pickShape(b.dataset.sh)};
$('#shp').onclick=()=>{setTool('shape');$('#shf').hidden=!$('#shf').hidden};shpIc();
document.addEventListener('click',e=>{if(!e.target.closest('.shw'))$('#shf').hidden=1;if(!e.target.closest('.mw'))$('#mnu').hidden=1});
function leave(fn){if(!isDirty()){fn();return}const d=$('#dlg');$('#dtx').textContent='Save “'+cur.name+'” before leaving?';d.hidden=0;
 $('#dyes').onclick=async()=>{d.hidden=1;const ok=await saveNow();if(ok!==false)fn()};$('#dno').onclick=()=>{d.hidden=1;fn()};d.onclick=e=>{if(e.target==d)d.hidden=1}}
$('#hb').onclick=()=>{$('#mnu').hidden=!$('#mnu').hidden};
$('#nw1').onclick=()=>leave(()=>openNew('blank'));$('#gl').onclick=()=>leave(()=>go('lib','all'));
$('#mnu').onclick=e=>{const b=e.target.closest('[data-m]');if(!b)return;$('#mnu').hidden=1;const k=b.dataset.m;
 if(k=='new')leave(()=>openNew('blank'));else if(k=='gal')leave(()=>go('lib','all'));else if(k=='save')saveNow(1);else if(k=='exp')$('#exp').click();
 else if(k=='lay')$('#lyr').click();else if(k=='fav'){$('#fv').click();toast(cur&&cur.fav?'Added to favourites':'Removed from favourites')}
 else if(k=='ren'){$('#bn').focus();$('#bn').select()}else if(k=='full')$('#full').click();else if(k=='clr')$('#clr').click();else if(k=='exit')leave(()=>go('home'))};
