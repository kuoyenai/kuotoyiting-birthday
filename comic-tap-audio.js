/* Start comic soundtrack on the first deliberate page tap, respecting manual pause. */
(()=>{
 const audio=document.getElementById(document.body.classList.contains('novel-edition')?'comicMusic':'bgm');
 if(!audio)return;
 let attempted=false;
 const onTap=e=>{
  if(attempted||!e.isTrusted||document.hidden)return;
  if(e.target.closest('a,button,input,select,textarea,summary,[role="button"],[contenteditable="true"]'))return;
  const pref=window.yitingMusicRead?.();
  if(pref?.paused===true)return;
  if(!audio.paused){attempted=true;return;}
  attempted=true;
  audio.muted=false;
  const promise=audio.play();
  if(promise&&typeof promise.catch==='function')promise.catch(()=>{attempted=false;});
 };
 document.addEventListener('pointerdown',onTap,{passive:true});
 document.addEventListener('touchend',onTap,{passive:true});
})();
