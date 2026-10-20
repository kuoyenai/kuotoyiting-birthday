(()=>{'use strict';
const canvas=document.getElementById('world');if(!canvas)return;
const motion=matchMedia('(prefers-reduced-motion: reduce)');
let afterImage=null,afterglowAt=null,afterglowPending=false,afterglowCount=0;
function clearAfterglow(){afterglowAt=null;afterglowPending=false;afterglowCount=0;}
function releaseAfter(){if(afterImage){afterImage.onload=afterImage.onerror=null;afterImage.removeAttribute('src');afterImage=null;}}
function loadAfter(){if(afterImage)return;const next=new Image();afterImage=next;next.decoding='async';next.src='assets/explore-birthday-celebration-after-wish-v1.png';next.decode().catch(()=>{if(afterImage===next)releaseAfter();});}
let blown=false;const art={lit:'assets/novel-candle-closeup.webp',out:'assets/novel-candles-after-wish.webp'};
const entry=document.createElement('button');entry.type='button';entry.id='openBirthdayWish';entry.className='wish-entry';entry.hidden=true;entry.setAttribute('aria-haspopup','dialog');entry.textContent='✦ 在心裡許個願';document.querySelector('.stage').append(entry);
const dialog=document.createElement('dialog');dialog.id='birthdayWishDialog';dialog.className='wish-dialog';dialog.setAttribute('aria-labelledby','birthdayWishTitle');dialog.innerHTML='<img id="birthdayWishArt" alt="五色星星蠟燭與生日蛋糕"><div class="wish-copy"><p class="wish-edition">ONLY FOR YITING / A SECRET WISH</p><h2 id="birthdayWishTitle">把願望，交給妳決定</h2><p class="wish-privacy">不必寫下，也不必告訴任何人。<br>選擇保留時，作者不會知道內容；只有主動確認分享，才會經由FormSubmit寄給送禮的人。</p><label for="birthdayWishInput">妳的生日願望（也可以不寫）</label><textarea id="birthdayWishInput" rows="3" maxlength="1000" placeholder="我希望，接下來的一年…" aria-label="妳的生日願望，也可以不寫"></textarea><p id="wishShareStatus" role="status"></p><p id="wishArtStatus" role="status"></p><button id="retryWishArt" type="button" hidden>重新載入插畫</button><div class="wish-candle" aria-hidden="true"><span class="wish-flame"></span><span class="wish-star">✦</span></div><p id="birthdayWishWords" role="status" aria-live="polite">閉上眼睛，想一個只屬於妳的願望。準備好了，再輕觸下方按鈕。</p><button id="blowBirthdayCandle" type="button">願望藏好了，吹熄蠟燭</button><button id="closeBirthdayWish" type="button">回到生日夜晚</button></div>';document.body.append(dialog);
const image=dialog.querySelector('#birthdayWishArt'),retry=dialog.querySelector('#retryWishArt'),status=dialog.querySelector('#wishArtStatus'),blow=dialog.querySelector('#blowBirthdayCandle'),words=dialog.querySelector('#birthdayWishWords');
function source(){return blown?art.out:art.lit;}
function sync(){entry.hidden=canvas.dataset.scene!=='wish';if(entry.hidden){releaseAfter();clearAfterglow();}else if(blown)loadAfter();}
image.onload=()=>{status.textContent='';retry.hidden=true;};image.onerror=()=>{status.textContent='插畫暫時無法載入，仍可繼續許願。';retry.hidden=false;};retry.onclick=()=>{status.textContent='正在重新載入插畫…';image.src=source()+'?retry='+Date.now();};
entry.onclick=()=>{window.yitingExploreResumeAudio?.();window.dispatchEvent(new Event('yiting-explore-modal'));blown=false;releaseAfter();clearAfterglow();dialog.dataset.blown='false';blow.disabled=false;blow.textContent='願望藏好了，吹熄蠟燭';words.textContent='閉上眼睛，想一個只屬於妳的願望。準備好了，再輕觸下方按鈕。';image.src=source();dialog.showModal();};
blow.onclick=()=>{if(blown)return;blown=true;afterglowPending=true;loadAfter();dialog.dataset.blown='true';blow.disabled=true;blow.textContent='願望已藏在心裡';words.textContent='銀虎：「那希望妳的願望，全部都能實現。」';image.src=source();};
dialog.querySelector('#closeBirthdayWish').onclick=()=>dialog.close();dialog.addEventListener('close',()=>canvas.focus({preventScroll:true}));blow.addEventListener('contextmenu',e=>e.preventDefault());
// Match the five painted candle tips in the original 1672×941 celebration plate.
let lightCount=0;
const tips=[[794,539],[816,537],[838,535],[860,537],[883,541]];
motion.addEventListener('change',()=>{if(motion.matches)clearAfterglow();});
window.addEventListener('resize',clearAfterglow);window.addEventListener('yiting-explore-modal',clearAfterglow);document.addEventListener('visibilitychange',()=>{if(document.hidden)clearAfterglow();});
window.YitingWishLights={draw(ctx,{x,y,width,height,t,reduced}){
 lightCount=0;afterglowCount=0;if(blown){
  const ready=afterImage?.complete&&afterImage.naturalWidth;
  if(ready)ctx.drawImage(afterImage,x,y,width,height);
  if(reduced||motion.matches){clearAfterglow();return;}
  if(dialog.open||!ready)return;
  if(afterglowPending){afterglowAt=t;afterglowPending=false;}
  if(afterglowAt===null)return;
  const progress=Math.max(0,(t-afterglowAt)/1400);
  if(progress>=1){clearAfterglow();return;}
  ctx.save();ctx.strokeStyle='#f4dfbf';ctx.lineWidth=Math.max(.65,height/941*1.2);ctx.globalAlpha=Math.sin(progress*Math.PI)*.32;
  for(let i=0;i<tips.length;i++){
   const [px,py]=tips[i],cx=x+px/1672*width,cy=y+py/941*height,rise=height/941*(5+progress*24),bend=Math.sin(progress*4+i)*height/941*3;
   ctx.beginPath();ctx.moveTo(cx,cy-1);ctx.bezierCurveTo(cx+bend,cy-rise*.35,cx-bend,cy-rise*.72,cx+bend*.4,cy-rise);ctx.stroke();afterglowCount++;
  }
  ctx.restore();return;
 }if(reduced)return;
 ctx.save();for(let i=0;i<tips.length;i++){
  const [px,py]=tips[i],cx=x+px/1672*width,cy=y+py/941*height,r=height/941*(15+Math.sin(t*.0018+i*1.7)*2);
  const light=ctx.createRadialGradient(cx,cy,0,cx,cy,r);light.addColorStop(0,'#ffe9b63b');light.addColorStop(.35,'#f8bd7020');light.addColorStop(1,'#edaf5900');
  ctx.fillStyle=light;ctx.beginPath();ctx.arc(cx,cy,r,0,Math.PI*2);ctx.fill();lightCount++;
 }ctx.restore();
},get count(){return lightCount;},get afterglowCount(){return afterglowCount;},get afterReady(){return !!afterImage?.complete&&!!afterImage?.naturalWidth;},get cachedAfterImages(){return afterImage?1:0;}};
new MutationObserver(sync).observe(canvas,{attributes:true,attributeFilter:['data-scene']});sync();
})();
