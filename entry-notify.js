(()=>{
 'use strict';
 const intro=document.getElementById('cinemaIntro');
 // A cached script must not enable the feature on an older, undisclosed entry.
 if(!intro?.querySelector('a[href="privacy.html"]'))return;
 const key='yiting-entry-notify-attempted-v1';
 const endpoint='https://formsubmit.co/ajax/kuoyen.ai@gmail.com';
 const labels={gate:'開啟星光之門',skip:'略過開場'};
 let attempted=false;
 function notify(entry){
  if(attempted)return;
  try{if(sessionStorage.getItem(key)==='1')return;}catch{}
  attempted=true;
  try{sessionStorage.setItem(key,'1');}catch{}
  try{
   // Same direct AJAX transport as the existing voluntary-sharing module.
   // Consume the reply in the background; never wait before continuing the opening.
   const payload={name:'生日網站入口通知',_subject:'YiTing｜網站入口通知',_template:'table',
    message:'有人按下「'+labels[entry]+'」。這僅代表入口點擊，無法確認訪客身分或是否已閱讀網站。',
    entry:labels[entry],time:new Date().toISOString(),source:'生日網站開場'};
   fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},
    credentials:'omit',referrerPolicy:'origin',keepalive:true,
    body:JSON.stringify(payload)}).then(response=>response.json()).catch(()=>{});
  }catch{}
 }
 for(const [id,entry]of [['introStart','gate'],['introSkip','skip']]){
  const button=document.getElementById(id);
  button?.addEventListener('click',()=>{if(!button.disabled)notify(entry);},{capture:true});
 }
})();
