'use strict';
// Test support only. A preflight never submits a form or sends email.
const endpoint='https://formsubmit.co/ajax/kuoyen.ai@gmail.com';
const origins=new Set(['https://kuotoyiting-birthday.vercel.app','https://kuoyenai.github.io']);
function assessPreflight(status,headers,body,origin){
 const h=Object.fromEntries(Object.entries(headers).map(([key,value])=>[key.toLowerCase(),String(value)]));
 const base={status,ready:false,server:h.server,allowOrigin:h['access-control-allow-origin']};
 if(status===403&&/error code:\s*1010/i.test(body))return {...base,reason:'access_denied_1010'};
 if(status===401||status===403)return {...base,reason:'access_denied'};
 if(status===429)return {...base,reason:'rate_limited'};
 if(status>=500)return {...base,reason:'service_unavailable'};
 if(status<200||status>=300)return {...base,reason:'preflight_http_error'};
 if(base.allowOrigin!=='*'&&base.allowOrigin!==origin)return {...base,reason:'cors_origin_rejected'};
 const tokens=value=>String(value||'').toLowerCase().split(',').map(s=>s.trim());
 // POST is CORS-safelisted as a method; JSON triggers the header preflight.
 // An absent allow-methods header alone must not reject a valid POST preflight.
 const allowed=tokens(h['access-control-allow-headers']);
 if(!allowed.includes('content-type')&&!allowed.includes('*'))return {...base,reason:'cors_json_rejected'};
 return {...base,ready:true,reason:'preflight_ready'};
}
async function probePreflight(request,origin){
 if(!origins.has(origin))throw new Error('Use a configured production origin');
 try{
  const response=await request.fetch(endpoint,{method:'OPTIONS',headers:{Origin:origin,
   'Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'},
   timeout:12000,maxRedirects:0,failOnStatusCode:false});
  return assessPreflight(response.status(),response.headers(),await response.text(),origin);
 }catch(error){return {ready:false,reason:'preflight_network_failed',error:String(error).split('\n')[0]};}
}
function assessSubmission(status,data){
 if(/activat|confirm.*email|verify.*email/i.test(String(data?.message||'')))return 'activation_required';
 return status===200&&(data?.success===true||data?.success==='true')?'provider_accepted':'not_accepted';
}
module.exports={endpoint,assessPreflight,probePreflight,assessSubmission};
