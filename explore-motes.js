(()=>{'use strict';
const palette={city:'#c5a2ef','portal-city':'#b7a5ec',asterum:'#b7c9f4',garden:'#77baff',greenhouse:'#c5a2ef',plaza:'#f2a3c0',observatory:'#8dd2b0',eunho:'#e57291',birthday:'#e7c789',wish:'#e7c789',farewell:'#e57291'};
const motion=matchMedia('(prefers-reduced-motion: reduce)');
function draw(ctx,{id,t,w,h,camera,reduced}){
 if(reduced||motion.matches||!palette[id])return;
 ctx.save();ctx.strokeStyle=ctx.fillStyle=palette[id];ctx.lineWidth=.8;
 const count=id==='birthday'?18:10;
 for(let i=0;i<count;i++){
  // Keep the character and lower interaction area free of ornament.
  const lane=i%2===0?.05+(i%5)*.045:.77+(i%5)*.042;
  const x=(lane*w+Math.sin(t*.00018+i*2.3)*5-camera*.012%13+w)%w;
  const y=h*(.1+((i*.173+t*(id==='eunho'?.000015:.000009))%.53));
  const size=id==='birthday'?1.2+(i%3)*.45:1.6+(i%2)*.6;
  ctx.globalAlpha=.12+.19*(.5+.5*Math.sin(t*.001+i));
  ctx.beginPath();
  if(id==='garden'&&i%3===0){ctx.ellipse(x,y,size*1.2,size*.7,-.4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(x+size,y);ctx.lineTo(x+size,y-size*4);ctx.lineTo(x+size*2.6,y-size*3.5);ctx.stroke();}
  else if(id==='greenhouse'&&i%3===0){ctx.arc(x,y,size*1.5,-1.1,1.1);ctx.stroke();}
  else if(['plaza','observatory','portal-city'].includes(id)){ctx.moveTo(x-size*1.5,y);ctx.lineTo(x+size*1.5,y);ctx.moveTo(x,y-size*1.5);ctx.lineTo(x,y+size*1.5);ctx.stroke();}
  else{ctx.arc(x,y,size,0,Math.PI*2);ctx.fill();}
 }
 ctx.restore();
}
window.YitingMotes={draw};
})();
