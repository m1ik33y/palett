/* Android app glue: back button, "Get the app" download, install prompt. */
const IN_APP=/PalettApp\//.test(navigator.userAgent);
/* The Android shell calls this on the hardware back button. Return true if the web app handled it. */
window.palettBack=function(){
 const hid=s=>{const e=document.querySelector(s);return !e||e.hidden};
 if(window.sheetsCloseTop&&sheetsCloseTop())return true;
 if(!hid('#mfs')){mfClose();return true}
 if(!hid('#dlg')){$('#dlg').hidden=true;return true}
 if(!hid('#mdl')){$('#mdl').hidden=true;return true}
 if(!hid('#pop')){$('#pop').hidden=true;return true}
 if(!hid('#tpop')){$('#tpop').hidden=true;return true}
 if(!hid('#auth'))return false;
 const c=document.body.classList;
 if(c.contains('studio')){$('#back').click();return true}
 if(!c.contains('home')){go('home');return true}
 return false};
/* Offer the real APK. Shown only on the web (not inside the app) and only when the file has been uploaded. */
window.apkOk=false;
let apkGone=false;try{apkGone=sessionStorage.getItem('apkbar')=='1'}catch(e){}
const apkSync=()=>{document.querySelectorAll('[data-getapp]').forEach(a=>a.hidden=!(window.apkOk&&!IN_APP));
 const on=!!(window.apkOk&&!IN_APP&&!apkGone),b=$('#apkbar');if(b){if(on&&!b.dataset.i){b.dataset.i=1;b.querySelector('.ablogo').innerHTML=LOGO}b.hidden=!on;document.body.classList.toggle('hasbar',on)}};
$('#apkx').onclick=()=>{apkGone=true;try{sessionStorage.setItem('apkbar','1')}catch(e){}apkSync()};
['showAuth','settingsPage'].forEach(n=>{const f=window[n];if(typeof f=='function')window[n]=function(){const r=f.apply(this,arguments);apkSync();return r}});
if(!IN_APP)fetch('/downloads/palett.apk',{method:'HEAD',cache:'no-store'}).then(r=>{
 window.apkOk=r.ok&&/android\.package-archive/.test(r.headers.get('content-type')||'');apkSync()}).catch(()=>{});
/* Chrome's own "Install app" banner is replaced by our Download button when the APK exists. */
addEventListener('beforeinstallprompt',e=>{if(window.apkOk||IN_APP)e.preventDefault()});
