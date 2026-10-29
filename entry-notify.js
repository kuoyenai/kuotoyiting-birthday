(()=>{
 'use strict';
 const intro=document.getElementById('cinemaIntro');
 // A cached script must not enable the feature on an older, undisclosed entry.
 if(!intro?.querySelector('a[href="privacy.html"]'))return;
 const key='yiting-entry-notify-attempted-v1';
 const endpoint='https://kuotoyiting-birthday.vercel.app/api/entry-notify';
 let attempted=false;
 function notify(entry){
  if(attempted)return;
  try{if(sessionStorage.getItem(key)==='1')return;}catch{}
  attempted=true;
  try{sessionStorage.setItem(key,'1');}catch{}
  try{
   // No await, no UI state, and no visitor content or identifier in the request.
   fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},
    credentials:'omit',referrerPolicy:'no-referrer',redirect:'error',keepalive:true,
    body:JSON.stringify({entry})}).catch(()=>{});
  }catch{}
 }
 for(const [id,entry]of [['introStart','gate'],['introSkip','skip']]){
  const button=document.getElementById(id);
  button?.addEventListener('click',()=>{if(!button.disabled)notify(entry);},{capture:true});
 }
})();
