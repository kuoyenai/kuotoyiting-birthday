(()=>{'use strict';
const canvas=document.getElementById('world');if(!canvas)return;
let lit=false,started=0;
const button=document.createElement('button');button.type='button';button.id='lightBirthdayStage';button.className='birthday-stage-entry';button.hidden=true;button.setAttribute('aria-pressed','false');button.textContent='✦ 點亮生日舞台';document.querySelector('.stage').append(button);
const status=document.createElement('span');status.id='birthdayStageStatus';status.className='birthday-stage-status';status.setAttribute('role','status');status.hidden=true;document.querySelector('.stage').append(status);
function sync(){const visible=canvas.dataset.scene==='birthday';button.hidden=!visible;status.hidden=!visible||!lit;}
button.onclick=()=>{lit=!lit;started=performance.now();button.setAttribute('aria-pressed',String(lit));button.textContent=lit?'✦ 收起舞台微光':'✦ 點亮生日舞台';status.textContent='YITING，今晚的星光為妳亮起。';canvas.dataset.stageLit=String(lit);window.yitingExploreResumeAudio?.();sync();};
button.addEventListener('contextmenu',e=>e.preventDefault());
new MutationObserver(sync).observe(canvas,{attributes:true,attributeFilter:['data-scene']});sync();
window.YitingStageLights={draw(ctx,{id,t,w,h,reduced}){if(id!=='birthday'||!lit)return;const fade=reduced?1:Math.min(1,Math.max(0,(t-started)/900));ctx.save();const colors=['#74bfff','#c9a1ff','#f6a9d9','#ec839b','#8cd4a2'];for(let i=0;i<5;i++){const x=w*(.14+i*.18),sway=reduced?0:Math.sin(t*.00035+i)*w*.014;const glow=ctx.createLinearGradient(x,0,x+sway,h*.84);glow.addColorStop(0,colors[i]+'00');glow.addColorStop(.22,colors[i]+'24');glow.addColorStop(1,colors[i]+'00');ctx.globalAlpha=.48*fade;ctx.fillStyle=glow;ctx.beginPath();ctx.moveTo(x-w*.012,0);ctx.lineTo(x+w*.012,0);ctx.lineTo(x+sway+w*.09,h*.84);ctx.lineTo(x+sway-w*.09,h*.84);ctx.closePath();ctx.fill();}ctx.globalAlpha=.5*fade;ctx.fillStyle='#f3d494';for(let i=0;i<18;i++){const px=w*((i*.61803398875)%1),py=h*(.12+((i*.37)%1)*.6)+(reduced?0:Math.sin(t*.0007+i)*5);ctx.beginPath();ctx.arc(px,py,1+(i%3)*.3,0,Math.PI*2);ctx.fill();}ctx.restore();},get lit(){return lit;}};
})();
