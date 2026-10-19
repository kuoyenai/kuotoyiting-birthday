(()=>{'use strict';const canvas=document.getElementById('world');if(!canvas)return;
const key='yiting-explore-gentleness-note',art='assets/novel-noah-pause.webp';let owned=false,found=false;try{owned=localStorage.getItem(key)==='1';}catch{}
const entry=document.createElement('button');entry.type='button';entry.id='openMoon';entry.className='moon-entry';entry.hidden=true;entry.setAttribute('aria-haspopup','dialog');document.querySelector('.stage').append(entry);
const dialog=document.createElement('dialog');dialog.id='moonDialog';dialog.className='moon-dialog';dialog.setAttribute('aria-labelledby','moonTitle');dialog.innerHTML='<img id="moonArt" alt="諾亞與YiTing在月光玻璃溫室裡休息"><div class="moon-copy"><p class="moon-edition">NOAH / A MOMENT TO REST</p><h2 id="moonTitle">在月光裡，休息一下</h2><p class="moon-instruction">慢慢滑動，讓月光亮起。<br>不用趕時間，想停就停。</p><p id="moonArtStatus" role="status"></p><button id="retryMoonArt" type="button" hidden>重新載入插畫</button><div class="moon-orb" aria-hidden="true"></div><label class="moon-range-label" for="moonLight">留一點溫柔給自己</label><input id="moonLight" type="range" min="0" max="100" step="1" value="0" aria-valuetext="0％月光"><output id="moonValue" for="moonLight">0%</output><p id="moonWords" role="status" aria-live="polite">諾亞：「有時候，妳也可以不用那麼努力。」</p><p id="moonSave" role="status"></p><button id="closeMoon" type="button">回到月光溫室</button></div>';document.body.append(dialog);
const image=dialog.querySelector('#moonArt'),retry=dialog.querySelector('#retryMoonArt'),status=dialog.querySelector('#moonArtStatus'),range=dialog.querySelector('#moonLight'),value=dialog.querySelector('#moonValue'),words=dialog.querySelector('#moonWords'),saveStatus=dialog.querySelector('#moonSave'),close=dialog.querySelector('#closeMoon');
function sync(){entry.hidden=canvas.dataset.scene!=='greenhouse';entry.textContent=owned?'✦ 重溫月光裡的溫柔':'✦ 和諾亞留一點月光';}
function render(){const n=Number(range.value);dialog.style.setProperty('--moon-opacity',String(.3+n*.007));dialog.style.setProperty('--moon-glow',String(8+n*.24)+'px');value.textContent=n+'%';range.setAttribute('aria-valuetext',n+'％月光');if(n===100&&!found){found=true;owned=true;words.textContent='諾亞：「累的時候，就好好休息吧。」';let saved=true;try{localStorage.setItem(key,'1');}catch{saved=false;}saveStatus.textContent=saved?'溫柔小記已收藏在這個瀏覽器。':'把溫柔留給自己；瀏覽器目前無法保存小記。';close.textContent='帶著溫柔繼續走';sync();}}
range.addEventListener('input',render);range.addEventListener('contextmenu',e=>e.preventDefault());function loadArt(again=false){status.textContent=again?'正在重新載入插畫…':'正在打開這一刻的插畫…';retry.hidden=true;image.onload=()=>{status.textContent='';retry.hidden=true;};image.onerror=()=>{status.textContent='插畫暫時無法載入，仍可繼續點亮月光。';retry.hidden=false;};image.src=art+(again?'?retry='+Date.now():'');}retry.onclick=()=>loadArt(true);
entry.onclick=()=>{window.yitingExploreResumeAudio?.();window.dispatchEvent(new Event('yiting-explore-modal'));found=false;range.value='0';words.textContent='諾亞：「有時候，妳也可以不用那麼努力。」';saveStatus.textContent='';close.textContent='回到月光溫室';render();loadArt();dialog.showModal();};close.onclick=()=>dialog.close();dialog.addEventListener('close',()=>{image.onload=image.onerror=null;image.removeAttribute('src');status.textContent='';retry.hidden=true;canvas.focus({preventScroll:true});});new MutationObserver(sync).observe(canvas,{attributes:true,attributeFilter:['data-scene']});
window.addEventListener('storage',event=>{if(event.key===key||event.key===null){try{owned=localStorage.getItem(key)==='1';}catch{owned=false;}sync();}});
let lit=false;
window.YitingMoonlight={draw(ctx,{id,t,h,w,camera,scale,anchor,reduced}){
 lit=false;if(id!=='greenhouse'||!owned||!Number.isFinite(anchor))return;
 const x=(anchor-camera)*scale,r=h*.2;if(x+r<0||x-r>w)return;lit=true;
 const sway=reduced?0:Math.sin(t*.00023)*h*.006;
 ctx.save();ctx.translate(x,h*.85);
 // A soft pool from the glass roof stays behind the original cast.
 ctx.scale(1,.17);const pool=ctx.createRadialGradient(0,0,0,0,0,r);
 pool.addColorStop(0,'#e3d0fa32');pool.addColorStop(.55,'#c5a2ef19');pool.addColorStop(1,'#bba6e800');
 ctx.fillStyle=pool;ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.scale(1,1/.17);
 const shaft=ctx.createLinearGradient(0,-h*.75,0,0);shaft.addColorStop(0,'#e6dafa00');shaft.addColorStop(.45,'#d7c4ee09');shaft.addColorStop(1,'#d7c4ee00');ctx.fillStyle=shaft;
 ctx.beginPath();ctx.moveTo(h*.12+sway,-h*.75);ctx.lineTo(h*.2+sway,-h*.75);ctx.lineTo(r*.7,0);ctx.lineTo(-r*.7,0);ctx.closePath();ctx.fill();
 ctx.globalAlpha=.2;ctx.strokeStyle='#e3d3f6';ctx.lineWidth=.7;
 for(let i=0;i<3;i++){ctx.beginPath();ctx.ellipse((i-1)*r*.28,0,r*(.25+i*.1),h*.009,0,-.5,Math.PI*.8);ctx.stroke();}
 ctx.restore();
},get visible(){return lit;}};
sync();
})();
