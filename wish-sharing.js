(()=>{
 'use strict';
 const recipient='kuoyen.ai@gmail.com',endpoint='https://formsubmit.co/ajax/'+recipient;
 const input=document.getElementById('wish')||document.getElementById('birthdayWishInput');
 const save=document.getElementById('saveWish')||document.getElementById('blowBirthdayCandle');
 const status=document.getElementById('wishStatus')||document.getElementById('wishShareStatus');
 if(!input||!save||!status)return;
 const candle=input.id==='birthdayWishInput',originalSave=save.onclick;
 let pending=false,lastSent='',snapshot='';
 const choices=document.createElement('div');choices.className='wish-choices';
 save.before(choices);choices.append(save);
 save.type='button';if(!candle)save.textContent='保留在心裡';
 const share=document.createElement('button');share.type='button';share.id='shareWish';share.className='wish-share-button';share.textContent='分享給送禮的人';share.setAttribute('aria-haspopup','dialog');choices.append(share);
 const note=document.createElement('p');note.className='wish-share-note';note.textContent='妳可以保留秘密，也可以讓送禮的人陪妳一起期待。只有確認分享，才會寄信。';choices.after(note);
 status.setAttribute('aria-live','polite');
 const dialog=document.createElement('dialog');dialog.id='wishShareConfirm';dialog.className='wish-share-dialog';dialog.setAttribute('aria-labelledby','wishShareTitle');
 dialog.innerHTML='<div class="wish-share-mark" aria-hidden="true">✦</div><p class="wish-share-edition">A WISH, SHARED WITH YOU</p><h2 id="wishShareTitle">讓我陪妳，一起期待</h2><p class="wish-share-intro">這次，妳願意把願望分享給送禮的人嗎？</p><blockquote id="wishSharePreview"></blockquote><p class="wish-share-recipient">收件人 <strong>'+recipient+'</strong></p><p class="wish-share-disclosure" id="wishShareDisclosure">按下「確認寄出願望」後，這段文字會經由FormSubmit寄到上述信箱，送禮的人就能讀到內容。服務會保留送件紀錄30天。<a href="https://formsubmit.co/privacy.pdf" target="_blank" rel="noopener noreferrer">寄信服務隱私說明</a></p><p id="wishSendStatus" role="status" aria-live="polite"></p><div class="wish-send-actions"><button id="confirmWishShare" type="button" aria-describedby="wishShareDisclosure">確認寄出願望</button><button id="cancelWishShare" type="button">再想一下</button></div>';
 document.body.append(dialog);
 const confirm=dialog.querySelector('#confirmWishShare'),cancel=dialog.querySelector('#cancelWishShare'),sendStatus=dialog.querySelector('#wishSendStatus');
 function update(){share.disabled=pending||!input.value.trim()||input.value.trim()===lastSent;}
 function message(text){status.textContent=text;sendStatus.textContent=text;}
 input.addEventListener('input',()=>{if(!pending){status.textContent='';if(!candle){save.disabled=false;save.textContent='保留在心裡';}}update();});
 save.onclick=event=>{
  if(pending)return;
  if(!candle){originalSave?.call(save,event);return;}
  if(input.value.trim())try{localStorage.setItem('yiting-birthday-wish',input.value);status.textContent='這次願望只保存在妳的瀏覽器，沒有上傳或寄送。';}catch{status.textContent='這次沒有寄送。瀏覽器無法保存，請自行複製留念。';}
  originalSave?.call(save,event);
 };
 share.onclick=()=>{
  const text=input.value.trim();if(pending||!text||text===lastSent)return;
  snapshot=text;dialog.querySelector('#wishSharePreview').textContent=text;sendStatus.textContent='';confirm.textContent='確認寄出願望';cancel.textContent='再想一下';confirm.disabled=false;
  window.dispatchEvent(new Event('yiting-explore-modal'));dialog.showModal();const title=dialog.querySelector('#wishShareTitle');title.tabIndex=-1;title.focus({preventScroll:true});dialog.scrollTop=0;
 };
 cancel.onclick=()=>dialog.close();
 dialog.addEventListener('close',()=>{if(share.isConnected&&!share.disabled)share.focus({preventScroll:true});else input.focus({preventScroll:true});});
 confirm.onclick=async()=>{
  if(pending||!snapshot||snapshot===lastSent)return;
  if(!navigator.onLine){message('目前沒有網路，願望尚未寄出。文字仍在這裡，連線後可再試一次。');return;}
  pending=true;update();confirm.disabled=true;input.readOnly=true;save.dataset.wasDisabled=String(save.disabled);save.disabled=true;
  dialog.setAttribute('aria-busy','true');message('正在寄出願望，請稍候…');
  const controller=new AbortController(),timeout=setTimeout(()=>controller.abort(),20000);
  try{
   const response=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},credentials:'omit',signal:controller.signal,body:JSON.stringify({name:'YiTing 生日願望',message:snapshot,_subject:'YiTing｜她願意分享的生日願望',_template:'table',source:candle?'2D星光旅程':location.pathname.endsWith('game.html')?'電影互動漫畫':location.pathname.endsWith('movie.html')?'生日電影':'生日收藏',consent:'本人已閱讀收件人及寄信服務說明，並按下「確認寄出願望」。'})});
   const result=await response.json();
   if(/activat|confirm.*email|verify.*email/i.test(String(result.message||''))){message('分享功能還在等待收件人啟用，願望尚未確認寄出。妳的文字仍在這裡，也可以先選擇保留在心裡。');return;}
   if(!response.ok||(result.success!==true&&result.success!=='true'))throw new Error('Not accepted');
   lastSent=snapshot;
   if(candle&&save.dataset.wasDisabled!=='true')originalSave?.call(save,new Event('click'));
   message('願望已送交寄信服務，謝謝妳願意分享。願這份期待，慢慢走向實現。');
   confirm.textContent='願望已送出';confirm.disabled=true;cancel.textContent='收好這份心意';
  }catch{
   message('暫時無法確認寄送結果，文字仍在這裡。請稍後確認，避免重複寄送；妳也可以保留在心裡。');
  }finally{
   clearTimeout(timeout);pending=false;input.readOnly=false;save.disabled=candle?document.getElementById('birthdayWishDialog').dataset.blown==='true':save.dataset.wasDisabled==='true';delete save.dataset.wasDisabled;
   dialog.removeAttribute('aria-busy');if(snapshot!==lastSent)confirm.disabled=false;update();
  }
 };
 dialog.addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight',' '].includes(event.key)&&!['TEXTAREA','INPUT','BUTTON','A'].includes(event.target.tagName))event.stopPropagation();});
 update();
})();
