(()=>{
 'use strict';
 // Public browser configuration. The recipient is fixed in the EmailJS template.
 const endpoint='https://api.emailjs.com/api/v1.0/email/send';
 const config={service_id:'service_jd01axj',template_id:'template_k29m9mg',user_id:'4Sj5SlBCGV8p10cMs'};
 let tail=Promise.resolve(),lastStarted=0;
 function send(params,options={}){
  // Only the six documented fields are allowed; saved browser content is never read here.
  const template_params={};
  for(const key of ['subject','message','source','entry','time','consent'])template_params[key]=String(params[key]||'');
  const task=tail.then(async()=>{
   const wait=Math.max(0,1100-(Date.now()-lastStarted));
   if(wait)await new Promise(resolve=>setTimeout(resolve,wait));
   if(options.signal?.aborted)throw new DOMException('Aborted','AbortError');
   lastStarted=Date.now();
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'text/plain'},credentials:'omit',referrerPolicy:'origin',keepalive:!!options.keepalive,signal:options.signal,body:JSON.stringify({...config,template_params})});
   const text=await response.text();
   if(response.status!==200||text.trim()!=='OK')throw new Error('EmailJS did not accept the message');
   return true;
  });
  // Never retry a failed send automatically or let it block a later explicit action.
  tail=task.catch(()=>{});return task;
 }
 window.YiTingMail=Object.freeze({send});
})();
