(()=>{'use strict';
// A quiet layer behind actors: rain stops with the city at 10:20.
const canvas=document.getElementById('world');if(!canvas)return;
let previous='',phase=0,last=null,state='off',count=0,traffic=0;
window.YitingCityWeather={
 draw(ctx,{id,t,w,h,reduced}){
  const enabled=!reduced&&(id==='city'||id==='portal-city');
  if(!enabled){previous=id;last=null;state='off';count=0;traffic=0;return;}
  const frozen=id==='portal-city',elapsed=last===null||previous!==id?0:Math.max(0,Math.min(50,t-last));
  if(!frozen)phase+=elapsed;
  previous=id;last=t;state=frozen?'frozen':'rain';count=24;
  ctx.save();ctx.lineCap='round';ctx.lineWidth=.65;
  for(let i=0;i<count;i++){
   const side=i%2===0,depth=i%3,lane=side?.035+(i%6)*.037:.81+(i%6)*.028;
   const x=lane*w,y=h*(.08+((i*.137+phase*(.00013+depth*.00002))%.65)),length=3+depth*2;
   ctx.globalAlpha=frozen?.17:.09+depth*.025;ctx.strokeStyle=frozen?'#c6d5ff':'#b7c8e9';
   ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+(frozen?0:1),y+length);ctx.stroke();
   // Tiny cool reflections remain below the walking lane, never over faces.
   if(i%4===0){ctx.globalAlpha=frozen?.09:.06;ctx.beginPath();ctx.moveTo(x-2,h*.94);ctx.lineTo(x+3+depth,h*.94);ctx.stroke();}
  }
  // Distant traffic shares the same suspended time as the rain, behind all actors.
  traffic=3;
  for(let i=0;i<traffic;i++){
   const direction=i%2?1:-1,travel=((phase*.000035*(1+i*.15)+i*.37)%1),px=(direction>0?travel:1-travel)*w,py=h*(.565+i*.026);
   ctx.globalAlpha=.13;ctx.strokeStyle=i%2?'#ef9ba9':'#f4d9b1';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(px,py);ctx.lineTo(px-direction*7,py);ctx.stroke();
   ctx.globalAlpha=.2;ctx.fillStyle=i%2?'#ef9ba9':'#f4d9b1';for(const offset of [0,3]){ctx.beginPath();ctx.arc(px+offset,py,.8,0,Math.PI*2);ctx.fill();}
  }
  ctx.restore();
 },
 get trafficCount(){return traffic;},get state(){return state;},get count(){return count;},get phase(){return phase;}
};
})();
