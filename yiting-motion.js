(()=>{'use strict';
const TAU=Math.PI*2,atlas=new Image();atlas.src='assets/explore-yiting-rig-v2.png';
let loadPromise;
const ready=()=>loadPromise||(loadPromise=atlas.decode().catch(error=>{loadPromise=null;throw error;}));
// Source rectangles are set after inspecting the generated transparent rig atlas.
const parts={body:[106,8,442,574],upperArm:[697,134,205,353],forearm:[1077,181,204,399],thigh:[294,630,253,332],shin:[689,652,211,307],shoe:[998,862,334,141]};
function foot(phase){const p=((phase%1)+1)%1;if(p<.6)return {x:180-360*p/.6,y:0,angle:p<.1?-.12*(1-p/.1):p>.48?.16*(p-.48)/.12:0};const u=(p-.6)/.4;return {x:-180+360*(u*u*(3-2*u)),y:-70*Math.sin(Math.PI*u),angle:-.18*Math.sin(Math.PI*u)};}
const frames=Array.from({length:60},(_,i)=>{const p=i/60;return {near:foot(p),far:foot(p+.5),bob:-5*Math.cos(p*TAU*2),arm:Math.sin(p*TAU)*.25};});
const lerp=(a,b,t)=>a+(b-a)*t;
function pose(phase,amount){const p=((phase%1)+1)%1*60,i=Math.floor(p),t=p-i,a=frames[i],b=frames[(i+1)%60];const result={bob:lerp(a.bob,b.bob,t)*amount,arm:lerp(a.arm,b.arm,t)*amount};for(const [name,idle]of[['near',12],['far',-12]])result[name]={x:lerp(idle,lerp(a[name].x,b[name].x,t),amount),y:lerp(a[name].y,b[name].y,t)*amount,angle:lerp(a[name].angle,b[name].angle,t)*amount};return result;}
function part(ctx,name,x,y,width,height,angle=0,anchorX=.5,anchorY=0){const box=parts[name];if(!box)return;ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.drawImage(atlas,...box,-width*anchorX,-height*anchorY,width,height);ctx.restore();}
function joint(ctx,x,y,r,cloth){ctx.save();ctx.beginPath();ctx.arc(x,y,r,0,TAU);ctx.clip();const box=cloth==='pants'?[371,700,85,85]:[750,260,80,80];ctx.drawImage(atlas,...box,x-r,y-r,r*2,r*2);ctx.restore();}
function limb(ctx,name,start,end,width){const dx=end.x-start.x,dy=end.y-start.y;part(ctx,name,start.x,start.y,width,Math.hypot(dx,dy)+12,Math.atan2(dy,dx)-Math.PI/2,.5,.035);}
function leg(ctx,footPoint,hip,far){const ankle={x:footPoint.x,y:footPoint.y-41},l1=235,l2=230,dx=ankle.x-hip.x,dy=ankle.y-hip.y,d=Math.min(l1+l2-.1,Math.max(1,Math.hypot(dx,dy))),angle=Math.atan2(dy,dx)-Math.acos(Math.max(-1,Math.min(1,(l1*l1+d*d-l2*l2)/(2*l1*d)))),knee={x:hip.x+l1*Math.cos(angle),y:hip.y+l1*Math.sin(angle)};ctx.save();if(far)ctx.filter='brightness(.83)';joint(ctx,hip.x,hip.y,45,'pants');joint(ctx,knee.x,knee.y,37,'pants');joint(ctx,ankle.x,ankle.y,26,'pants');limb(ctx,'thigh',hip,knee,95);limb(ctx,'shin',knee,ankle,78);part(ctx,'shoe',ankle.x,ankle.y,122,50,footPoint.angle,.42,.12);ctx.restore();}
function arm(ctx,shoulder,angle,far){const elbow={x:shoulder.x+Math.sin(angle)*152,y:shoulder.y+Math.cos(angle)*152},wrist={x:elbow.x+Math.sin(angle+.13)*155,y:elbow.y+Math.cos(angle+.13)*155};ctx.save();if(far)ctx.filter='brightness(.86)';joint(ctx,shoulder.x,shoulder.y,37,'sleeve');joint(ctx,elbow.x,elbow.y,25,'sleeve');limb(ctx,'upperArm',shoulder,elbow,87);limb(ctx,'forearm',elbow,wrist,66);ctx.restore();}
function draw(ctx,x,y,height,facing,phase,amount){const p=pose(phase,amount);ctx.save();ctx.translate(x,y);ctx.scale(facing*height/1000,height/1000);const hip={x:0,y:-500+amount*37+p.bob};leg(ctx,p.far,{x:18,y:hip.y},true);arm(ctx,{x:20,y:hip.y-280},-p.arm,true);leg(ctx,p.near,{x:28,y:hip.y},false);part(ctx,'body',0,hip.y,270,520,-.012*amount,.65,1);arm(ctx,{x:-42,y:hip.y-270},p.arm,false);ctx.restore();}
window.YitingMotion={ready,draw,pose,frames,parts};
})();
