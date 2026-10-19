(()=>{'use strict';const canvas=document.getElementById('world');if(!canvas)return;
const art='assets/novel-yejun-guitar-fullhead-v2.webp',key='yiting-explore-hope-note';let owned=false;try{owned=localStorage.getItem(key)==='1';}catch{}const selected=new Set();
const entry=document.createElement('button');entry.type='button';entry.id='openGarden';entry.className='garden-entry';entry.hidden=true;entry.setAttribute('aria-haspopup','dialog');document.querySelector('.stage').append(entry);
const dialog=document.createElement('dialog');dialog.id='gardenDialog';dialog.className='garden-dialog';dialog.setAttribute('aria-labelledby','gardenTitle');dialog.innerHTML='<img id="gardenArt" alt="藝俊在星光音樂花園彈奏吉他"><div class="garden-copy"><p class="garden-edition">YEJUN / REMEMBER YOUR FIRST LIGHT</p><h2 id="gardenTitle">跟著旋律，點亮希望</h2><p class="garden-instruction">輕觸三朵藍色花光，讓希望慢慢綻放。<br>沒有順序，也不用趕時間。</p><p id="gardenArtStatus" role="status"></p><button id="retryGardenArt" type="button" hidden>重新載入插畫</button><div class="garden-flowers" role="group" aria-label="三朵藍色花光"></div><p id="gardenCount" aria-live="polite">0 / 3</p><p id="gardenWords" role="status" aria-live="polite">琴聲穿過花叢，帶她走向發光的步道。</p><p id="gardenSave" role="status"></p><button id="closeGarden" type="button">回到音樂花園</button></div>';document.body.append(dialog);
const image=dialog.querySelector('#gardenArt'),retry=dialog.querySelector('#retryGardenArt'),status=dialog.querySelector('#gardenArtStatus'),count=dialog.querySelector('#gardenCount'),words=dialog.querySelector('#gardenWords'),saved=dialog.querySelector('#gardenSave'),close=dialog.querySelector('#closeGarden'),flowers=dialog.querySelector('.garden-flowers');
const phrases=['花朵仍隨著剛才的旋律輕輕搖擺。','藍色星光，把最初喜歡的心情留在這裡。','藝俊：「這一顆，代表希望。」'];
function sync(){entry.hidden=canvas.dataset.scene!=='garden';entry.textContent=owned?'✦ 重看花園的希望':'✦ 和藝俊點亮花光';}
for(let i=0;i<3;i++){const button=document.createElement('button');button.type='button';button.dataset.flower=String(i);button.setAttribute('aria-label','點亮第'+(i+1)+'朵藍色花光');button.setAttribute('aria-pressed','false');button.innerHTML='<span aria-hidden="true">✿</span><small>0'+(i+1)+'</small>';button.onclick=()=>{if(selected.has(i))return;selected.add(i);button.setAttribute('aria-pressed','true');count.textContent=selected.size+' / 3';words.textContent=phrases[i];if(selected.size===3){owned=true;words.textContent='藝俊：「希望妳不管走到哪裡，都能記得自己最初喜歡的事情。」';let success=true;try{localStorage.setItem(key,'1');}catch{success=false;}saved.textContent=success?'希望小記已收藏在這個瀏覽器。':'把希望留在心裡；瀏覽器目前無法保存小記。';close.textContent='帶著希望繼續走';sync();}};button.addEventListener('contextmenu',e=>e.preventDefault());flowers.append(button);}
function loadArt(again=false){status.textContent=again?'正在重新載入插畫…':'正在打開這一刻的插畫…';retry.hidden=true;image.onload=()=>{status.textContent='';retry.hidden=true;};image.onerror=()=>{status.textContent='插畫暫時無法載入，仍可繼續點亮花光。';retry.hidden=false;};image.src=art+(again?'?retry='+Date.now():'');}retry.onclick=()=>loadArt(true);
entry.onclick=()=>{window.yitingExploreResumeAudio?.();window.dispatchEvent(new Event('yiting-explore-modal'));selected.clear();flowers.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed','false'));count.textContent='0 / 3';words.textContent='琴聲穿過花叢，帶她走向發光的步道。';saved.textContent='';close.textContent='回到音樂花園';loadArt();dialog.showModal();};close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>{image.onload=image.onerror=null;image.removeAttribute('src');status.textContent='';retry.hidden=true;canvas.focus({preventScroll:true});});new MutationObserver(sync).observe(canvas,{attributes:true,attributeFilter:['data-scene']});
window.addEventListener('storage',event=>{if(event.key===key||event.key===null){try{owned=localStorage.getItem(key)==='1';}catch{owned=false;}sync();}});
let blooms=0;
window.YitingGardenBloom={draw(ctx,{id,t,h,w,camera,scale,anchor,reduced}){
 blooms=0;if(id!=='garden'||!owned||!Number.isFinite(anchor))return;
 const size=h*.012,ground=h*.865;
 ctx.save();ctx.strokeStyle='#77baff';ctx.fillStyle='#8fc9ff';ctx.lineWidth=.8;
 for(let i=0;i<3;i++){
  const x=(anchor+(i-1)*65-camera)*scale,y=ground+(i%2)*h*.012;
  if(x<-size*4||x>w+size*4)continue;blooms++;
  const sway=reduced?0:Math.sin(t*.0007+i)*.06;
  ctx.save();ctx.translate(x,y);ctx.rotate(sway);
  ctx.globalAlpha=.28;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo(size*.3,-size*.8,0,-size*1.5);ctx.stroke();
  ctx.translate(0,-size*1.7);ctx.globalAlpha=.38;
  for(let petal=0;petal<5;petal++){ctx.rotate(Math.PI*2/5);ctx.beginPath();ctx.ellipse(0,-size*.65,size*.38,size*.7,0,0,Math.PI*2);ctx.fill();}
  ctx.globalAlpha=.8;ctx.fillStyle='#f5e7bb';ctx.beginPath();ctx.arc(0,0,size*.23,0,Math.PI*2);ctx.fill();ctx.fillStyle='#8fc9ff';ctx.restore();
 }
 ctx.restore();
},get visible(){return blooms;}};
sync();
})();
