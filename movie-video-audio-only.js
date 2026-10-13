/* Movie-only audio policy: the film video is the sole audible media source. */
(()=>{
 const film=document.getElementById('film');
 const song=document.getElementById('song');
 if(!film||!song)return;
 const birthdayPlayer=document.querySelector('.birthday-player');
 if(birthdayPlayer){birthdayPlayer.hidden=true;birthdayPlayer.setAttribute('aria-hidden','true');}
 song.pause();
 song.muted=true;
 song.addEventListener('play',()=>{song.pause();song.muted=true;});
 document.querySelectorAll('audio').forEach(audio=>{
  audio.pause();audio.muted=true;
  audio.addEventListener('play',()=>{audio.pause();audio.muted=true;});
 });
 film.muted=false;
})();
