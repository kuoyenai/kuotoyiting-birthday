(()=>{'use strict';
// World-positioned light gates stay behind the character and never block input.
let passages=[];
window.YitingPassages={
 configure(items){passages=items.filter(item=>Number.isFinite(item.x)).map(item=>({...item}));},
 draw(ctx,{t,w,h,camera,scale,reduced,playerX}){
  const rx=h*.12,ry=h*.34,cy=h*.51;
  for(const gate of passages){
   const cx=(gate.x-camera)*scale;if(cx+rx*1.8<0||cx-rx*1.8>w)continue;
   const proximity=Number.isFinite(playerX)?Math.max(0,1-Math.abs(playerX-gate.x)/220):0;
   const response=reduced?0:proximity;
   const tint=gate.returning?'#efb6cd':'#b5c9ff',phase=reduced?0:t*.00016;
   ctx.save();ctx.translate(cx,cy);
   const glow=ctx.createRadialGradient(0,0,0,0,0,ry);
   glow.addColorStop(0,tint+'03');glow.addColorStop(.7,tint+(Math.round(8+response*16).toString(16).padStart(2,'0')));glow.addColorStop(1,tint+'00');
   ctx.scale(rx/ry,1);ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,0,ry*1.2,0,Math.PI*2);ctx.fill();ctx.scale(ry/rx,1);
   for(let ring=3;ring>=0;ring--){
    ctx.strokeStyle=ring===0?'#fff1d5':tint;ctx.globalAlpha=[.52,.18,.09,.04][ring]*(1+response*.35);ctx.lineWidth=ring===0?1.3:3+ring*3;
    ctx.beginPath();ctx.ellipse(0,0,rx+ring*2,ry+ring*2,0,0,Math.PI*2);ctx.stroke();
   }
   ctx.globalAlpha=.28;ctx.lineWidth=1;ctx.strokeStyle='#f8e7bd';
   for(let i=0;i<3;i++){const start=phase+i*Math.PI*2/3;ctx.beginPath();ctx.ellipse(0,0,rx*.93,ry*.98,0,start,start+.45);ctx.stroke();}
   for(let i=0;i<14;i++){
    const angle=i*Math.PI*2/14+phase,px=Math.cos(angle)*rx,py=Math.sin(angle)*ry;
    ctx.globalAlpha=.2+(i%3)*.1;ctx.fillStyle=i%4===0?'#f6d9a2':tint;
    ctx.beginPath();ctx.arc(px,py,1+(i%3)*.35,0,Math.PI*2);ctx.fill();
   }
   if(response>0){
    for(let i=0;i<6;i++){
     const a=i*Math.PI/3+t*.0004;
     ctx.globalAlpha=response*.28;ctx.fillStyle=tint;
     ctx.beginPath();ctx.arc(Math.cos(a)*rx*.84,Math.sin(a)*ry*.94,1.2,0,Math.PI*2);ctx.fill();
    }
   }
   // Grounded threshold light: stays at the gate, behind feet and all actors.
   const contact=reduced?0:proximity,groundY=h*.85-cy;
   for(let ripple=0;ripple<3;ripple++){
    const travel=reduced?ripple/3:((t*.00022+ripple/3)%1);
    ctx.globalAlpha=(.035+contact*.14)*(1-travel);
    ctx.strokeStyle=ripple===0?'#f8e7bd':tint;ctx.lineWidth=.8;
    ctx.beginPath();ctx.ellipse(0,groundY,rx*(.45+travel*.95),h*(.006+travel*.018),0,0,Math.PI*2);ctx.stroke();
   }
   ctx.globalAlpha=.2;ctx.strokeStyle=tint;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(0,ry,rx*.9,h*.018,0,0,Math.PI*2);ctx.stroke();ctx.restore();
  }
 },get count(){return passages.length;}
};
})();
