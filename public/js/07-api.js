/* Tiny fetch wrapper for the backend. Cookies carry the session. */
async function api(path,o={}){
  const init={method:o.method||'GET',credentials:'same-origin',headers:{}};
  if(o.body!==undefined){init.headers['content-type']='application/json';init.body=JSON.stringify(o.body)}
  let r;
  try{r=await fetch('/api'+path,init)}
  catch(e){const x=new Error('Network error. Check your connection.');x.status=0;throw x}
  let d=null;try{d=await r.json()}catch(e){}
  if(!r.ok){
    const x=new Error((d&&d.error)||'Request failed ('+r.status+')');x.status=r.status;
    if(r.status==401&&!/^\/(auth|archive)/.test(path)&&typeof sessionExpired=='function')sessionExpired();
    throw x}
  return d}

/* Media: files go to the storage bucket through the server (/api/upload), never straight from the browser. */
async function upMedia(blob,query,method){
  const r=await fetch('/api/upload?'+query,{method:method||'POST',credentials:'same-origin',headers:blob?{'content-type':blob.type||'application/octet-stream'}:{},body:blob||undefined});
  let d=null;try{d=await r.json()}catch(e){}
  if(!r.ok)throw new Error((d&&d.error)||'Upload failed ('+r.status+')');
  return d}
const imgSrc=im=>im._u||im.src; // stored form: short /api/media/... path when uploaded, data URL otherwise
const loadImg=s=>new Promise(r=>{const im=new Image();if(typeof s=='string'&&s.startsWith('/api/media/'))im._u=s;im.onload=im.onerror=()=>r(im);im.src=s});
const fileImg=f=>new Promise((res,rej)=>{const u=URL.createObjectURL(f),im=new Image();im.onload=()=>res(im);im.onerror=()=>{URL.revokeObjectURL(u);rej(new Error('Could not read that image'))};im.src=u});
const toBlobP=(c,t,q)=>new Promise(r=>c.toBlob(r,t,q));
const OKT=/^image\/(png|jpeg|webp|gif)$/;
/* Keep uploads small: big photos are scaled down (max side 3200px) before they are sent. */
async function fitImg(f,max){if(OKT.test(f.type)&&f.size<=5.5e6)return f;if(!OKT.test(f.type))return f;
  const im=await fileImg(f),k=Math.min(1,max/Math.max(im.width,im.height)),c=document.createElement('canvas');
  c.width=Math.max(1,Math.round(im.width*k));c.height=Math.max(1,Math.round(im.height*k));c.getContext('2d').drawImage(im,0,0,c.width,c.height);
  return await toBlobP(c,'image/webp',.88)||f}
/* Profile picture: centre-crop to a 256px square. */
async function avatarBlob(f){const im=await fileImg(f),s=Math.min(im.width,im.height),c=document.createElement('canvas');c.width=c.height=256;
  c.getContext('2d').drawImage(im,(im.width-s)/2,(im.height-s)/2,s,s,0,0,256,256);
  return await toBlobP(c,'image/webp',.9)}
