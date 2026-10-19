(()=>{'use strict';const canvas=document.getElementById('world');if(!canvas)return;
const key='yiting-explore-courage-note';let owned=false,found=false;try{owned=localStorage.getItem(key)==='1';}catch{}
const entry=document.createElement('button');entry.type='button';entry.className='sky-entry';entry.id='lookSky';entry.hidden=true;entry.setAttribute('aria-haspopup','dialog');document.querySelector('.stage').append(entry);
const dialog=document.createElement('dialog');dialog.id='skyDialog';dialog.className='sky-dialog';dialog.setAttribute('aria-labelledby','skyTitle');dialog.innerHTML='<div class="sky-map"><p class="sky-edition">HAMIN / A LITTLE COURAGE</p><h2 id="skyTitle">那顆很小，卻一直發光的星</h2><p class="sky-instruction">河玟說：妳看那裡。找找看，那道綠色的微光。</p><div class="sky-stars" role="group" aria-label="選擇星光"><button type="button" data-star="blue" aria-label="藍白色星光">✦</button><button type="button" data-star="green" aria-label="綠色星光">✦</button><button type="button" data-star="purple" aria-label="紫色星光">✦</button></div><div class="sky-message" role="status" aria-live="polite"></div><button type="button" id="closeSky">回到觀景台</button></div>';document.body.append(dialog);
const message=dialog.querySelector('.sky-message'),close=dialog.querySelector('#closeSky');
function sync(){entry.hidden=canvas.dataset.scene!=='observatory';entry.textContent=owned?'✦ 重看那顆綠色星星':'✦ 和河玟一起看星星';}
entry.onclick=()=>{window.yitingExploreResumeAudio?.();found=false;window.dispatchEvent(new Event('yiting-explore-modal'));dialog.querySelectorAll('[data-star]').forEach(b=>b.setAttribute('aria-pressed','false'));message.textContent='不用著急，慢慢看。';close.textContent='回到觀景台';dialog.showModal();};
dialog.querySelectorAll('[data-star]').forEach(button=>{button.onclick=()=>{if(found)return;if(button.dataset.star!=='green'){message.textContent='再看看，那顆很小，卻仍亮著的綠色星光。';return;}found=true;owned=true;button.setAttribute('aria-pressed','true');let saved=true;try{localStorage.setItem(key,'1');}catch{saved=false;}message.textContent='河玟：「雖然它很小，但還是一直在發光。」 '+(saved?'勇氣小記已收藏在這個瀏覽器。':'把這份勇氣留在心裡。瀏覽器目前無法保存小記。');close.textContent='把勇氣留在心裡';sync();};});
close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>{canvas.focus({preventScroll:true});});
dialog.addEventListener('contextmenu',event=>{if(event.target.closest('[data-star]'))event.preventDefault();});
new MutationObserver(sync).observe(canvas,{attributes:true,attributeFilter:['data-scene']});
window.addEventListener('storage',event=>{if(event.key===key||event.key===null){try{owned=localStorage.getItem(key)==='1';}catch{owned=false;}sync();}});
let visible=0;
window.YitingCourageSky={draw(ctx,{id,t,h,w,camera,scale,anchor,reduced}){
 visible=0;if(id!=='observatory'||!owned||!Number.isFinite(anchor))return;
 // The three colors echo the original optional interaction, above the cast.
 const stars=[{x:anchor-50,y:.18,color:'#b0d5ff',r:1.5},{x:anchor+150,y:.30,color:'#98d4ad',r:2.8},{x:anchor+230,y:.11,color:'#cbb3e4',r:1.5}].map(s=>({...s,x:(s.x-camera)*scale,y:s.y*h}));
 if(stars.every(s=>s.x<-20)||stars.every(s=>s.x>w+20))return;
 ctx.save();ctx.lineWidth=.65;ctx.strokeStyle='#a4cabb';ctx.globalAlpha=.16;
 ctx.beginPath();stars.forEach((s,i)=>i?ctx.lineTo(s.x,s.y):ctx.moveTo(s.x,s.y));ctx.stroke();
 for(let i=0;i<stars.length;i++){
  const s=stars[i];if(s.x<-20||s.x>w+20)continue;visible++;
  const size=s.r*Math.min(1.25,h/450),pulse=reduced?.6:.52+.1*Math.sin(t*.0008+i);
  ctx.globalAlpha=pulse;ctx.strokeStyle=ctx.fillStyle=s.color;
  ctx.beginPath();ctx.moveTo(s.x-size*1.8,s.y);ctx.lineTo(s.x+size*1.8,s.y);ctx.moveTo(s.x,s.y-size*1.8);ctx.lineTo(s.x,s.y+size*1.8);ctx.stroke();
  ctx.beginPath();ctx.arc(s.x,s.y,size*.42,0,Math.PI*2);ctx.fill();
  if(i===1){ctx.globalAlpha=.12;ctx.beginPath();ctx.arc(s.x,s.y,size*3.2,0,Math.PI*2);ctx.stroke();}
 }
 ctx.restore();
},get visible(){return visible;}};
sync();
})();
