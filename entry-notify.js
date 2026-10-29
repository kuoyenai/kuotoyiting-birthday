(()=>{
 'use strict';
 const intro=document.getElementById('cinemaIntro');
 // A cached script must not enable the feature on an older, undisclosed entry.
 if(!intro?.querySelector('a[href="privacy.html"]'))return;
 const key='yiting-entry-notify-attempted-v1';
 const labels={gate:'開啟星光之門',skip:'略過開場'};
 let attempted=false;
 function notify(entry){
  if(attempted)return;
  try{if(sessionStorage.getItem(key)==='1')return;}catch{}
  attempted=true;
  try{sessionStorage.setItem(key,'1');}catch{}
  try{
   // Never wait before continuing the opening; the shared transport checks 200 / OK.
   const payload={subject:'YiTing｜網站入口通知',
    message:'有人按下「'+labels[entry]+'」。這僅代表入口點擊，無法確認訪客身分或是否已閱讀網站。',
    entry:labels[entry],time:new Date().toISOString(),source:'生日網站開場'};
   window.YiTingMail?.send(payload,{keepalive:true}).catch(()=>{});
  }catch{}
 }
 for(const [id,entry]of [['introStart','gate'],['introSkip','skip']]){
  const button=document.getElementById(id);
  button?.addEventListener('click',()=>{if(!button.disabled)notify(entry);},{capture:true});
 }
})();
