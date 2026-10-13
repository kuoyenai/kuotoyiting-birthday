/* Global fallback: one user tap may unlock music when browser blocks autoplay. */
(()=>{
 const audio=document.querySelector('#homeSong, #comicMusic, #bgm, #song');
 if(!audio)return;
 let pending=false;
 function tap(e){
  if(pending||document.hidden||!e.isTrusted)return;
  if(e.target.closest('a,button,input,select,textarea,summary,[role="button"],[contenteditable="true"],dialog'))return;
  if(window.yitingMusicRead?.().paused===true)return;
  if(!audio.paused)return;
  pending=true;
  audio.muted=false;
  try{
   const p=audio.play();
   if(p?.then)p.then(()=>{pending=false;}).catch(()=>{pending=false;});
   else pending=false;
  }catch{pending=false;}
 }
 document.addEventListener('pointerdown',tap,{passive:true});
 document.addEventListener('touchend',tap,{passive:true});
})();
