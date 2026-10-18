(()=>{'use strict';
const canvas=document.getElementById('world');if(!canvas)return;
const configs={
 eunho:{source:'assets/explore-eunho-npc-v1.png',crop:{x:256,y:14,w:528,h:1507},height:.43},
 yejun:{source:'assets/explore-yejun-npc-v1.png',crop:{x:10,y:50,w:1014,h:1436},height:.36},
 noah:{source:'assets/explore-noah-npc-v1.png',crop:{x:262,y:15,w:660,h:1510},height:.42,origin:.39},
 bamby:{source:'assets/explore-bamby-npc-v1.png',crop:{x:195,y:8,w:588,h:1506},height:.41,origin:.59},
 concert:{source:'assets/explore-plave-concert-group-v1.png',crop:{x:0,y:0,w:1536,h:1024},height:.33},
 hamin:{source:'assets/explore-hamin-npc-v1.png',crop:{x:144,y:7,w:830,h:1518},height:.435,origin:.4}
};
const members={asterum:'eunho',eunho:'eunho',garden:'yejun',greenhouse:'noah',plaza:'bamby',observatory:'hamin',birthday:'concert'},records=new Map();
const preloads={'portal-city':['eunho'],asterum:['eunho','yejun'],garden:['yejun','noah'],greenhouse:['noah','bamby'],plaza:['bamby','hamin'],observatory:['hamin','eunho']};
let anchors=[],lastScene='',visible=0,enteredAt=0;const followPositions=new Map();
const following=(index,scene=canvas.dataset.scene)=>anchors.find(actor=>actor.member==='eunho'&&actor.scene===scene&&Number.isInteger(actor.followFrom)&&index>=actor.followFrom&&index<actor.followUntil);
const walkFrames=[["assets/explore-eunho-walk-contact-a-v2.png", 1464, 72, 570], ["assets/explore-eunho-walk-pass-a-v2.png", 1485, 47, 480], ["assets/explore-eunho-walk-contact-b-v2.png", 1466, 60, 570], ["assets/explore-eunho-walk-pass-b-v2.png", 1475, 43, 540]],idleFrame=["assets/explore-eunho-side-idle-v2.png", 1498, 56, 565];
let walk=null,follower=null;const motion=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
function clearWalk(){if(walk)for(const image of walk.images)image.removeAttribute('src');walk=null;followPositions.clear();follower=null;}
function loadWalk(retry){if(walk&&(walk.ready||walk.pending||!retry))return;clearWalk();const record={images:[],ready:false,pending:true};walk=record;const jobs=[...walkFrames,idleFrame].map(([name])=>{const image=new Image();image.decoding='async';image.fetchPriority='low';image.src=name;record.images.push(image);return image.decode();});Promise.all(jobs).then(()=>{if(walk===record)record.ready=true;}).catch(()=>{}).finally(()=>{record.pending=false;});}
function discard(member){records.get(member)?.image.removeAttribute('src');records.delete(member);}
function load(member,retry){
 const old=records.get(member);if(old&&(old.art||old.pending||!retry))return;if(old)discard(member);
 const image=new Image(),next={image,art:null,pending:true};records.set(member,next);
 image.decoding='async';image.fetchPriority='low';image.src=configs[member].source;
 image.decode().then(()=>{if(records.get(member)===next){next.art=image;next.readyAt=performance.now();}}).catch(()=>{}).finally(()=>next.pending=false);
}
function prepare(){
 const scene=canvas.dataset.scene,entered=scene!==lastScene;lastScene=scene;if(entered)enteredAt=performance.now();
 const current=members[scene],wanted=[...(preloads[scene]??(current?[current]:[]))];
 const companion=motion?.matches?null:following(Number(canvas.dataset.index));if(companion&&!wanted.includes(companion.member))wanted.push(companion.member);
 for(const member of records.keys())if(!wanted.includes(member))discard(member);
 for(const member of wanted)load(member,entered&&member===current);
 if(companion)loadWalk(entered);else clearWalk();
}
new MutationObserver(prepare).observe(canvas,{attributes:true,attributeFilter:['data-scene','data-index']});motion?.addEventListener('change',prepare);prepare();
window.YitingActors={
 configure(items){anchors=items.filter(item=>Number.isFinite(item.x)&&item.x>=0).map(item=>({...item}));followPositions.clear();prepare();},
 draw(ctx,{id,w,h,camera,scale,t=performance.now(),reduced=false,playerX=0,playerFacing=1,dt=0,index=-1}){
  visible=0;follower=null;const companion=!(motion?.matches??reduced)&&walk?.ready?following(index,id):null;
  const stage=anchors.filter(actor=>actor.scene===id&&actor.group==='concert');
  if(stage.length){
   const left=(Math.min(...stage.map(actor=>actor.x))-160-camera)*scale,right=(Math.max(...stage.map(actor=>actor.x))+160-camera)*scale;
   if(right>=0&&left<=w){ctx.save();ctx.fillStyle='#19213e99';ctx.strokeStyle='#e5cb8c88';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse((left+right)/2,h*.69,(right-left)/2,h*.024,0,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.restore();}
  }
  for(const actor of anchors){
   if(actor.scene!==id||actor===companion)continue;
   const config=configs[actor.member],record=records.get(actor.member),art=record?.art;if(!config||!art)continue;
   // Crop only transparent padding; preserve the entire physical silhouette.
   const crop=config.crop,height=h*config.height*(actor.heightScale??1),width=height*crop.w/crop.h,ground=h*(actor.ground??.85),cx=(actor.x-camera)*scale;
   if(cx+width<0||cx-width>w)continue;
   const elapsed=Math.max(0,t-Math.max(enteredAt,record.readyAt??0)),progress=Math.min(1,elapsed/650);
   ctx.save();ctx.globalAlpha*=reduced?1:progress*progress*(3-2*progress);const shadow=ctx.createRadialGradient(cx,ground,0,cx,ground,width*.52);
   shadow.addColorStop(0,'#11152e66');shadow.addColorStop(1,'#11152e00');ctx.fillStyle=shadow;
   ctx.save();ctx.translate(cx,ground);ctx.scale(1,.18);ctx.translate(-cx,-ground);ctx.beginPath();ctx.arc(cx,ground,width*.52,0,Math.PI*2);ctx.fill();ctx.restore();
   ctx.imageSmoothingEnabled=true;ctx.drawImage(art,crop.x,crop.y,crop.w,crop.h,cx-width*(config.origin??.5),ground-height,width,height);ctx.restore();visible++;
  }
  // Four separately reviewed key poses advance with travelled distance.
  // If any pose fails to decode, the original encounter remains stationary.
  if(companion&&Number.isFinite(playerX)){
   const config=configs[companion.member],standing=records.get(companion.member)?.art;
   if(config&&standing){
    const desired=playerX-(playerFacing||1)*110,previous=followPositions.get(companion.member);
    // Continue from the encounter when it is nearby; a distant restored save starts alongside YiTing.
    const oldX=previous?.x??(Math.abs(companion.x-desired)<=450?companion.x:desired),limit=300*Math.min(.04,Math.max(0,dt));
    const eased=(desired-oldX)*(1-Math.exp(-Math.max(0,dt)*5)),step=Math.max(-limit,Math.min(limit,eased));
    const px=Math.abs(oldX-desired)>450?desired:oldX+step;
    const stride=Math.max(1,h*config.height/scale*.6);
    const distance=px-oldX,stepping=Math.abs(distance)>.04,phase=((previous?.phase??0)+Math.abs(distance)/stride)%1,direction=stepping?Math.sign(distance):(Math.sign(playerX-px)||playerFacing||1);
    followPositions.set(companion.member,{x:px,phase,direction});
    const ground=h*.85,cx=(px-camera)*scale,height=h*config.height,frame=stepping?Math.floor(phase*4)%4:-1;
    if(cx+height>=0&&cx-height<=w){
     ctx.save();ctx.fillStyle='#11152e44';ctx.beginPath();ctx.ellipse(cx,ground,height*.13,height*.018,0,0,Math.PI*2);ctx.fill();
     ctx.translate(cx,ground);ctx.scale(direction>0?1:-1,1);ctx.imageSmoothingEnabled=true;
     const pose=frame>=0?walkFrames[frame]:idleFrame,image=walk.images[frame>=0?frame:4],unit=height/(pose[1]-pose[2]);
     ctx.drawImage(image,0,0,image.naturalWidth,image.naturalHeight,-pose[3]*unit,-pose[1]*unit,image.naturalWidth*unit,image.naturalHeight*unit);
     ctx.restore();visible++;follower={member:companion.member,x:px,frame,direction,phase,stride};
    }
   }
  }
 },get ready(){const scene=canvas.dataset.scene;return !!records.get(members[scene])?.art;},get visible(){return visible;},get count(){return anchors.length;},get cachedActors(){return records.size;},get cachedMembers(){return [...records.keys()];},get walkReady(){return !!walk?.ready;},get walkingFrames(){return walk?walkFrames.length:0;},get follower(){return follower?{...follower}:null;}
};
})();
