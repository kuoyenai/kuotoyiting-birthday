(()=>{'use strict';
const canvas=document.getElementById('world');if(!canvas)return;
let blown=false;const art={lit:'assets/novel-candle-closeup.webp',out:'assets/novel-candles-after-wish.webp'};
const entry=document.createElement('button');entry.type='button';entry.id='openBirthdayWish';entry.className='wish-entry';entry.hidden=true;entry.setAttribute('aria-haspopup','dialog');entry.textContent='✦ 在心裡許個願';document.querySelector('.stage').append(entry);
const dialog=document.createElement('dialog');dialog.id='birthdayWishDialog';dialog.className='wish-dialog';dialog.setAttribute('aria-labelledby','birthdayWishTitle');dialog.innerHTML='<img id="birthdayWishArt" alt="五色星星蠟燭與生日蛋糕"><div class="wish-copy"><p class="wish-edition">ONLY FOR YITING / A SECRET WISH</p><h2 id="birthdayWishTitle">把願望，輕輕留在心裡</h2><p class="wish-privacy">不必寫下，也不必告訴任何人。<br>願望只留在妳心裡，作者不會知道內容。</p><p id="wishArtStatus" role="status"></p><button id="retryWishArt" type="button" hidden>重新載入插畫</button><div class="wish-candle" aria-hidden="true"><span class="wish-flame"></span><span class="wish-star">✦</span></div><p id="birthdayWishWords" role="status" aria-live="polite">閉上眼睛，想一個只屬於妳的願望。準備好了，再輕觸下方按鈕。</p><button id="blowBirthdayCandle" type="button">願望藏好了，吹熄蠟燭</button><button id="closeBirthdayWish" type="button">回到生日夜晚</button></div>';document.body.append(dialog);
const image=dialog.querySelector('#birthdayWishArt'),retry=dialog.querySelector('#retryWishArt'),status=dialog.querySelector('#wishArtStatus'),blow=dialog.querySelector('#blowBirthdayCandle'),words=dialog.querySelector('#birthdayWishWords');
function source(){return blown?art.out:art.lit;}
function sync(){entry.hidden=canvas.dataset.scene!=='wish';}
image.onload=()=>{status.textContent='';retry.hidden=true;};image.onerror=()=>{status.textContent='插畫暫時無法載入，仍可繼續許願。';retry.hidden=false;};retry.onclick=()=>{status.textContent='正在重新載入插畫…';image.src=source()+'?retry='+Date.now();};
entry.onclick=()=>{window.yitingExploreResumeAudio?.();window.dispatchEvent(new Event('yiting-explore-modal'));blown=false;dialog.dataset.blown='false';blow.disabled=false;blow.textContent='願望藏好了，吹熄蠟燭';words.textContent='閉上眼睛，想一個只屬於妳的願望。準備好了，再輕觸下方按鈕。';image.src=source();dialog.showModal();};
blow.onclick=()=>{if(blown)return;blown=true;dialog.dataset.blown='true';blow.disabled=true;blow.textContent='願望已藏在心裡';words.textContent='銀虎：「那希望妳的願望，全部都能實現。」';image.src=source();};
dialog.querySelector('#closeBirthdayWish').onclick=()=>dialog.close();dialog.addEventListener('close',()=>canvas.focus({preventScroll:true}));blow.addEventListener('contextmenu',e=>e.preventDefault());
new MutationObserver(sync).observe(canvas,{attributes:true,attributeFilter:['data-scene']});sync();
})();
