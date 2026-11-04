/* Boot: restore the session from the cookie, otherwise show the login screen */
$('.brand i').innerHTML=LOGO;
(()=>{const u=URL.createObjectURL(new Blob([LOGO],{type:'image/svg+xml'})),im=new Image();im.onload=()=>{const c=document.createElement('canvas');c.width=c.height=180;c.getContext('2d').drawImage(im,0,0,180,180);const l=document.createElement('link');l.rel='apple-touch-icon';l.href=c.toDataURL();document.head.append(l);URL.revokeObjectURL(u)};im.src=u})();
try{brushPrev()}catch(e){console.error(e)}skUpd();
if(innerWidth<=800)$('#side').hidden=true;
paint(document);if(!$('#side').hidden)$('#pan').classList.add('on');theme();avatar();
(async()=>{try{const r=await api('/me');await startSession(r.user)}catch(e){showAuth('in')}})();
