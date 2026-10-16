(()=>{'use strict';let half=null,scene='',points=[],contacts=0;
function draw(ctx,state){const {id,phase,amount,x,camera,scale,height,ground,facing,dt,reduced}=state;
 if(id!==scene){scene=id;points=[];half=null;contacts=0;}
 const currentHalf=Math.floor(phase*2);
 if(id!=='plaza'){half=currentHalf;return;}
 if(half!==null&&currentHalf!==half&&amount>.4){contacts++;if(!reduced)points.push({x:x+facing*(height/scale)*.18,age:0});}
 half=currentHalf;points=points.map(p=>({...p,age:p.age+dt})).filter(p=>p.age<.6);
 ctx.save();ctx.lineWidth=1.4;ctx.strokeStyle='#f6a9d9';ctx.fillStyle='#f7a6d4';
 if(reduced){ctx.globalAlpha=.08;ctx.beginPath();ctx.ellipse((x-camera)*scale,ground,height*.14,height*.022,0,0,Math.PI*2);ctx.fill();}
 else for(const p of points){const age=p.age/.6,r=height*(.065+.085*age);ctx.globalAlpha=.3*(1-age);ctx.beginPath();ctx.ellipse((p.x-camera)*scale,ground+1,r,r*.2,0,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=.08*(1-age);ctx.fill();}
 ctx.restore();}
window.YitingFootsteps={draw,get contacts(){return contacts;},get active(){return points.length;}};
})();
