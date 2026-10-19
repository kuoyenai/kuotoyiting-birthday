(()=>{'use strict';const canvas=document.getElementById('world');if(!canvas)return;
const key='yiting-explore-joy-note';let owned=false,count=0,saved=true;try{owned=localStorage.getItem(key)==='1';}catch{}
const panel=document.createElement('div');panel.id='plazaJoy';panel.className='plaza-joy';panel.hidden=true;panel.innerHTML='<div class="joy-dots" aria-hidden="true"><span>✦</span><span>✦</span><span>✦</span></div><p id="joyWords" role="status" aria-live="polite"></p><small id="joyCount"></small>';document.querySelector('.stage').append(panel);
const words=panel.querySelector('#joyWords'),counter=panel.querySelector('#joyCount');
function render(){panel.hidden=canvas.dataset.scene!=='plaza';const n=owned?3:count;panel.querySelectorAll('.joy-dots span').forEach((dot,i)=>dot.classList.toggle('lit',i<n));panel.dataset.complete=String(n===3);panel.dataset.saveFailed=String(n===3&&!saved);canvas.dataset.joyCount=String(n);words.textContent=n===3?'斑比：「以後也要像剛剛那樣，多笑一點！」':'跟著斑比，踩亮三次粉色星光。';counter.textContent=n===3?(saved?'快樂小記已留在這個瀏覽器。':'把快樂留在心裡；瀏覽器目前無法保存小記。'):n+' / 3 · 向前或向後走，都可以。';}
window.addEventListener('yiting-explore-footstep',event=>{if(canvas.dataset.scene!=='plaza'||event.detail?.id!=='plaza'||owned)return;const n=event.detail.count;if(!Number.isInteger(n)||n<0)return;count=Math.min(3,n);if(count===3){owned=true;try{localStorage.setItem(key,'1');}catch{saved=false;}}render();});
new MutationObserver(()=>{if(canvas.dataset.scene!=='plaza')count=0;else if(!owned)count=Math.min(3,window.YitingFootsteps?.contacts||0);render();}).observe(canvas,{attributes:true,attributeFilter:['data-scene']});
window.addEventListener('storage',event=>{if(event.key===key||event.key===null){try{owned=localStorage.getItem(key)==='1';}catch{owned=false;}count=0;saved=true;render();}});
let visible=0;
window.YitingJoyTrail={draw(ctx,{id,t,h,w,camera,scale,anchor,reduced}){
 visible=0;if(id!=='plaza'||!Number.isFinite(anchor))return;
 const n=owned?3:count;if(!n)return;
 const size=Math.min(18,h*.032),ground=h*.835;
 ctx.save();ctx.strokeStyle='#f2a3c0';ctx.fillStyle='#f2a3c0';ctx.lineWidth=.8;
 for(let i=0;i<n;i++){
  const x=(anchor-120+i*80-camera)*scale,y=ground+(i%2)*h*.009;
  if(x+size<0||x-size>w)continue;visible++;
  ctx.globalAlpha=reduced?.35:.31+.05*Math.sin(t*.0008+i);
  ctx.beginPath();ctx.moveTo(x-size,y);ctx.lineTo(x,y-size*.24);ctx.lineTo(x+size,y);ctx.lineTo(x,y+size*.24);ctx.closePath();ctx.stroke();
  ctx.globalAlpha=.09;ctx.fill();ctx.globalAlpha=.55;
  ctx.beginPath();ctx.moveTo(x,y-size*.12);ctx.lineTo(x+size*.13,y);ctx.lineTo(x,y+size*.12);ctx.lineTo(x-size*.13,y);ctx.closePath();ctx.fill();
 }
 ctx.restore();
},get visible(){return visible;}};
render();
})();
