/* Film audio only during viewing; collection songs allowed only while birthday dialog is open. */
(()=>{
 const film=document.getElementById('film'),song=document.getElementById('song'),dialog=document.getElementById('birthday');
 if(!film||!song||!dialog)return;
 const collectionOpen=()=>dialog.open;
 function sync(){
  if(collectionOpen()){
   film.pause();
   song.muted=false;
  }else{
   song.pause();
   song.muted=true;
  }
 }
 song.addEventListener('play',()=>{
  if(!collectionOpen()){song.pause();song.muted=true;return;}
  film.pause();song.muted=false;
 });
 film.addEventListener('play',()=>{if(!collectionOpen())song.pause();else film.pause();});
 dialog.addEventListener('close',sync);
 new MutationObserver(sync).observe(dialog,{attributes:true,attributeFilter:['open']});
 sync();
})();
