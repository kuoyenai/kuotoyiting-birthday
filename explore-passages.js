(()=>{'use strict';
// World-positioned light gates stay behind the character and never block input.
let passages=[];
window.YitingPassages={
 configure(items){passages=items.filter(item=>Number.isFinite(item.x)).map(item=>({...item}));},
 draw(ctx,{t,w,h,camera,scale,reduced}){
  const rx=h*.12,ry=h*.34,cy=h*.51;
  for(const gate of passages){
   const cx=(gate.x-camera)*scale;if(cx+rx*1.8<0||cx-rx*1.8>w)continue;
   const tint=gate.returning?'#efb6cd':'#b5c9ff',phase=reduced?0:t*.00016;
   ctx.save();ctx.translate(cx,cy);
   const glow=ctx.createRadialGradient(0,0,0,0,0,ry);
   glow.addColorStop(0,tint+'03');glow.addColorStop(.7,tint+'08');glow.addColorStop(1,tint+'00');
   ctx.scale(rx/ry,1);ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,ry*1.2,0,Math.PI*2);ctx.fill();ctx.scale(ry/rx,1);
   for(let ring=3;ring>=0;ring--){
    ctx.strokeStyle=ring===0?'#fff1d5':tint;ctx.globalAlpha=[.52,.18,.09,.04][ring];ctx.lineWidth=ring===0?1.3:3+ring*3;
    ctx.beginPath();ctx.ellipse(0,0,rx+ring*2,ry+ring*2,0,0,Math.PI*2);ctx.stroke();
   }
   ctx.globalAlpha=.28;ctx.lineWidth=1;ctx.strokeStyle='#f8e7bd';
   for(let i=0;i<3;i++){const start=phase+i*Math.PI*2/3;ctx.beginPath();ctx.ellipse(0,0,rx*.93,ry*.98,0,start,start+.45);ctx.stroke();}
   for(let i=0;i<14;i++){
    const angle=i*Math.PI*2/14+phase,px=Math.cos(angle)*rx,py=Math.sin(angle)*ry;
    ctx.globalAlpha=.2+(i%3)*.1;ctx.fillStyle=i%4===0?'#f6d9a2':tint;
    ctx.beginPath();ctx.arc(px,py,1+(i%3)*.35,0,Math.PI*2);ctx.fill();
   }
   ctx.globalAlpha=.2;ctx.strokeStyle=tint;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,ry,rx*.9,h*.018,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
 },get count(){return passages.length;}
};
})();
