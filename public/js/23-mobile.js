/* Phone layout: bottom navbar actions and the Folder sheet */
$('#mnav .logo').innerHTML=LOGO;
function mfClose(){if($('#mfs').hidden)return;$('#mfs').hidden=1;$('#mbd').hidden=1;$('#mnav [data-ms=folder]').classList.remove('on')}
function mfOpen(){$('#mfs').hidden=0;$('#mbd').hidden=0;$('#mnav [data-ms=folder]').classList.add('on');ftRender()}
$('#mnav').addEventListener('click',e=>{const b=e.target.closest('[data-ms]');if(!b)return;
 if(b.dataset.ms=='set'){mfClose();go('set')}else $('#mfs').hidden?mfOpen():mfClose()});
$('#mbd').onclick=mfClose;
addEventListener('keydown',e=>{if(e.key=='Escape')mfClose()});
PH.addEventListener('change',()=>mfClose());
