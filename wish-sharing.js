(()=>{
 'use strict';
 const recipient='kuoyen.ai@gmail.com';
 function mountSharing(input,save,status,letter=false){
  if(!input||!save||!status)return;
  const candle=!letter&&input.id==='birthdayWishInput',originalSave=save.onclick;
  const item=letter?'這段話':'願望',kind=letter?'letter':'wish';
  let pending=false,lastSent='';
  const choices=document.createElement('div');choices.className='wish-choices';choices.dataset.shareKind=kind;
  const note=document.createElement(letter?'small':'p');note.className='wish-share-note';note.dataset.shareKind=kind;
  note.innerHTML='按下「分享給Kuo」就會立即寄到 <strong>'+recipient+'</strong>。只有這次填寫的'+item+'會透過EmailJS與已連接的Gmail服務寄出。<a href="https://www.emailjs.com/legal/privacy-policy/" target="_blank" rel="noopener noreferrer">寄信服務隱私說明</a>';
  const sendStatus=document.createElement('small');sendStatus.id=letter?'letterSendStatus':'wishSendStatus';sendStatus.className='share-send-status';sendStatus.setAttribute('role','status');sendStatus.setAttribute('aria-live','polite');
  const letterActions=letter?save.closest('.letter-actions'):null;
  if(letterActions)letterActions.before(note,choices,sendStatus);else save.before(note,choices,sendStatus);choices.append(save);
  save.type='button';if(!candle&&!letter)save.textContent='保留在心裡';
  const share=document.createElement('button');share.type='button';share.id=letter?'shareLetter':'shareWish';share.className='wish-share-button';share.textContent='分享給Kuo';choices.append(share);
  note.id=letter?'letterShareDisclosure':'wishShareDisclosure';share.setAttribute('aria-describedby',note.id);
  status.setAttribute('aria-live','polite');
  function update(){share.disabled=pending||!input.value.trim()||input.value.trim()===lastSent;share.textContent=pending?'正在寄出…':input.value.trim()&&input.value.trim()===lastSent?'已分享給Kuo ✓':'分享給Kuo';}
  input.addEventListener('input',()=>{if(!pending){status.textContent='';sendStatus.textContent='';if(!candle&&!letter){save.disabled=false;save.textContent='保留在心裡';}}update();});
  save.onclick=event=>{
   if(pending)return;sendStatus.textContent='';
   if(!candle){originalSave?.call(save,event);return;}
   if(input.value.trim())try{localStorage.setItem('yiting-birthday-wish',input.value);status.textContent='這次願望只保存在妳的瀏覽器，沒有上傳或寄送。';}catch{status.textContent='這次沒有寄送。瀏覽器無法保存，請自行複製留念。';}
   originalSave?.call(save,event);
  };
  share.onclick=async()=>{
   const snapshot=input.value.trim();if(pending||!snapshot||snapshot===lastSent)return;
   if(!navigator.onLine){sendStatus.textContent='目前沒有網路，'+item+'尚未寄出。文字仍在這裡，連線後可再試一次。';return;}
   const wasDisabled=save.disabled,wasReadOnly=input.readOnly;
   pending=true;update();input.readOnly=true;save.disabled=true;status.textContent='';sendStatus.textContent='正在寄出'+item+'，請稍候…';choices.setAttribute('aria-busy','true');
   const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
   try{
    if(!window.YiTingMail)throw new Error('Mail transport unavailable');
    await window.YiTingMail.send({message:snapshot,subject:letter?'YiTing｜她願意分享的未來回信':'YiTing｜她願意分享的生日願望',source:letter?'生日信 · 留給未來自己的話':candle?'2D星光旅程':location.pathname.endsWith('game.html')?'電影互動漫畫':location.pathname.endsWith('movie.html')?'生日電影':'生日收藏',time:new Date().toISOString(),consent:'本人已閱讀收件人及寄信服務說明，主動按下「分享給Kuo」立即寄出這次填寫的內容。'},{signal:controller.signal});
    lastSent=snapshot;
    if(candle&&!wasDisabled)originalSave?.call(save,new Event('click'));
    sendStatus.textContent=letter?'這段話已送交寄信服務，謝謝妳願意分享。願妳未來回頭看時，也記得此刻的自己。':'願望已送交寄信服務，謝謝妳願意分享。願這份期待，慢慢走向實現。';
   }catch{
    sendStatus.textContent='暫時無法確認寄送結果，文字仍在這裡。請稍後確認，避免重複寄送；妳也可以'+(letter?'收藏在這台裝置。':'保留在心裡。');
   }finally{
    clearTimeout(timeout);pending=false;input.readOnly=wasReadOnly;save.disabled=candle?document.getElementById('birthdayWishDialog')?.dataset.blown==='true':wasDisabled;
    choices.removeAttribute('aria-busy');update();
   }
  };
  update();
 }
 mountSharing(document.getElementById('wish')||document.getElementById('birthdayWishInput'),document.getElementById('saveWish')||document.getElementById('blowBirthdayCandle'),document.getElementById('wishStatus')||document.getElementById('wishShareStatus'));
 const letterInput=document.getElementById('birthdayLetterReply'),letterBox=letterInput?.closest('.birthday-letter');
 mountSharing(letterInput,letterBox?.querySelector('.letter-save'),letterBox?.querySelector('.letter-status'),true);
})();
