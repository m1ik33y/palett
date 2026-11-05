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
    if(archOpen){const id=(path.match(/^\/books\/([^/?]+)/)||[])[1],ab=id&&books.find(b=>b.id==id&&b.arch);
      if((r.status==403&&/locked/i.test(x.message))||(r.status==404&&ab)){x.message='Archive session expired. Enter the password again.';x.archExpired=true;archExpire()}}
    if(r.status==401&&!/^\/(auth|archive)/.test(path)&&typeof sessionExpired=='function')sessionExpired();
    throw x}
  return d}
