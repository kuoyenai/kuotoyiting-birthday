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
const members={asterum:'eunho',eunho:'eunho',garden:'yejun',greenhouse:'noah',plaza:'bamby',observatory:'hamin',farewell:'eunho',birthday:'concert'},records=new Map();
const preloads={wish:['eunho'],'portal-city':['eunho'],asterum:['eunho','yejun'],garden:['yejun','noah'],greenhouse:['noah','bamby'],plaza:['bamby','hamin'],observatory:['hamin','eunho']};
let anchors=[],lastScene='',visible=0,visibleMembers=[],enteredAt=0;const followPositions=new Map();
const following=(index,scene=canvas.dataset.scene)=>anchors.find(actor=>walkSets[actor.member]&&(actor.scene===scene||actor.followScenes?.includes(scene))&&Number.isInteger(actor.followFrom)&&index>=actor.followFrom&&index<actor.followUntil);
const walkFrames=[["assets/explore-eunho-walk-contact-a-v2.png", 1464, 72, 570], ["assets/explore-eunho-walk-pass-a-v2.png", 1485, 47, 480], ["assets/explore-eunho-walk-contact-b-v2.png", 1466, 60, 570], ["assets/explore-eunho-walk-pass-b-v2.png", 1475, 43, 540]],idleFrame=["assets/explore-eunho-side-idle-v2.png", 1498, 56, 565];
const walkSets={eunho:{frames:[...walkFrames,idleFrame],height:.43},...(window.YitingCompanionPoses||{})};
let walk=null,follower=null,retiring=null,announcedCompanion=null;const motion=typeof matchMedia==='function'?matchMedia('(prefers-reduced-motion: reduce)'):null;
function releaseWalk(record){if(record)for(const image of record.images)image.removeAttribute('src');}
function clearRetiring(){releaseWalk(retiring?.record);retiring=null;}
function clearWalk(preserve=false){clearRetiring();if(preserve&&walk&&follower)retiring={record:walk,pose:{...follower},age:0};else releaseWalk(walk);walk=null;followPositions.clear();follower=null;}
function loadWalk(member,retry){if(walk?.member===member&&(walk.ready||walk.pending||!retry))return;clearWalk(!!walk&&walk.member!==member&&!(motion?.matches));const set=walkSets[member];if(!set)return;const record={member,set,images:[],poseImages:[],ready:false,pending:true};walk=record;const sources=new Map();for(const [name]of set.frames){if(!sources.has(name)){const image=new Image();image.decoding='async';image.fetchPriority='low';image.src=name;sources.set(name,image);record.images.push(image);}record.poseImages.push(sources.get(name));}Promise.all(record.images.map(image=>image.decode())).then(()=>{if(walk===record){record.ready=true;record.readyAt=performance.now();}}).catch(()=>{}).finally(()=>record.pending=false);}
function discard(member){records.get(member)?.image.removeAttribute('src');records.delete(member);}
function load(member,retry){
 const old=records.get(member);if(old&&(old.art||old.pending||!retry))return;if(old)discard(member);
 const image=new Image(),next={image,art:null,pending:true};records.set(member,next);
 image.decoding='async';image.fetchPriority='low';image.src=configs[member].source;
 image.decode().then(()=>{if(records.get(member)===next){next.art=image;next.readyAt=performance.now();}}).catch(()=>{}).finally(()=>next.pending=false);
}
function prepare(){
 const scene=canvas.dataset.scene,entered=scene!==lastScene;lastScene=scene;if(entered)enteredAt=performance.now();
 if(window.YitingGroupCompanions?.active){clearWalk();for(const member of [...records.keys()])discard(member);return;}
 const current=members[scene];let wanted=[...(preloads[scene]??(current?[current]:[]))];
 const companion=motion?.matches?null:following(Number(canvas.dataset.index));if(companion)wanted=[...new Set([companion.member,current,...wanted].filter(Boolean))].slice(0,2);
 for(const member of records.keys())if(!wanted.includes(member))discard(member);
 for(const member of wanted)load(member,entered&&member===current);
 if(companion)loadWalk(companion.member,entered);else clearWalk();
}
new MutationObserver(prepare).observe(canvas,{attributes:true,attributeFilter:['data-scene','data-index']});motion?.addEventListener('change',prepare);prepare();
window.YitingActors={
 configure(items){anchors=items.filter(item=>Number.isFinite(item.x)&&item.x>=0).map(item=>({...item}));followPositions.clear();prepare();},
 draw(ctx,{id,w,h,camera,scale,t=performance.now(),reduced=false,playerX=0,playerFacing=1,dt=0,index=-1}){
  visible=0;visibleMembers=[];follower=null;if(window.YitingWelcomeParty?.draw(ctx,{id,w,h,camera,scale,t,reduced,playerX})){visibleMembers=window.YitingWelcomeParty.visibleMembers;visible=visibleMembers.length;follower={member:'welcome',x:playerX,frame:-1};if(announcedCompanion!=='welcome'){announcedCompanion='welcome';window.dispatchEvent(new CustomEvent('yiting-explore-companion',{detail:{member:'welcome'}}));}return;}if(window.YitingGroupCompanions?.active){window.YitingGroupCompanions.draw(ctx,{id,w,h,camera,scale,t,reduced,playerX,playerFacing,dt});visibleMembers=window.YitingGroupCompanions.visibleMembers;visible=visibleMembers.length;const active=visible===5?(id==='wish'?'celebration':'plave'):null;follower=active?{member:active,x:playerX,frame:-1}:null;if(active!==announcedCompanion){announcedCompanion=active;window.dispatchEvent(new CustomEvent('yiting-explore-companion',{detail:{member:active}}));}return;}const candidate=following(index,id),companion=!(motion?.matches??reduced)&&walk?.ready&&walk.member===candidate?.member?candidate:null;
  if(retiring){
   retiring.age+=Math.max(0,dt);if(reduced||motion?.matches||retiring.age>=.45)clearRetiring();
   else{const {record,pose}=retiring,height=h*(record.set.height??configs[pose.member].height),ground=h*.85,cx=(pose.x-camera)*scale,poseIndex=pose.frame>=0?pose.frame:4,frame=record.set.frames[poseIndex],image=record.poseImages[poseIndex],unit=height/(frame[1]-frame[2]),crop=frame[4]??[0,0,image.naturalWidth,image.naturalHeight];
    if(cx+height>=0&&cx-height<=w){ctx.save();ctx.globalAlpha*=1-retiring.age/.45;ctx.translate(cx,ground);ctx.scale(pose.direction>0?1:-1,1);ctx.drawImage(image,...crop,-frame[3]*unit,-frame[1]*unit,crop[2]*unit,crop[3]*unit);ctx.restore();visible++;visibleMembers.push(pose.member);}
   }
  }
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
   ctx.imageSmoothingEnabled=true;ctx.drawImage(art,crop.x,crop.y,crop.w,crop.h,cx-width*(config.origin??.5),ground-height,width,height);ctx.restore();visible++;visibleMembers.push(actor.member);
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
    const walkingHeight=walk.set.height??config.height,stride=Math.max(1,h*walkingHeight/scale*.6);
    const distance=px-oldX,stepping=Math.abs(distance)>.04,phase=((previous?.phase??0)+Math.abs(distance)/stride)%1,direction=stepping?Math.sign(distance):(Math.sign(playerX-px)||playerFacing||1);
    followPositions.set(companion.member,{x:px,phase,direction});
    const ground=h*.85,cx=(px-camera)*scale,height=h*walkingHeight,frame=stepping?Math.floor(phase*4)%4:-1;
    if(cx+height>=0&&cx-height<=w){
     ctx.save();ctx.globalAlpha*=Math.min(1,Math.max(0,t-(walk.readyAt??t))/350);ctx.fillStyle='#11152e44';ctx.beginPath();ctx.ellipse(cx,ground,height*.13,height*.018,0,0,Math.PI*2);ctx.fill();
     ctx.translate(cx,ground);ctx.scale(direction>0?1:-1,1);ctx.imageSmoothingEnabled=true;
     const poseIndex=frame>=0?frame:4,pose=walk.set.frames[poseIndex],image=walk.poseImages[poseIndex],unit=height/(pose[1]-pose[2]),crop=pose[4]??[0,0,image.naturalWidth,image.naturalHeight];
     ctx.drawImage(image,...crop,-pose[3]*unit,-pose[1]*unit,crop[2]*unit,crop[3]*unit);
     ctx.restore();visible++;visibleMembers.push(companion.member);follower={member:companion.member,x:px,frame,direction,phase,stride};
    }
   }
  }
  const active=follower?.member??null;if(active!==announcedCompanion){announcedCompanion=active;window.dispatchEvent(new CustomEvent('yiting-explore-companion',{detail:{member:active}}));}
 },get ready(){if(window.YitingGroupCompanions?.active)return window.YitingGroupCompanions.ready;const scene=canvas.dataset.scene;return !!records.get(members[scene])?.art;},get visible(){return visible;},get visibleMembers(){return [...visibleMembers];},get count(){return anchors.length;},get cachedActors(){return records.size;},get cachedMembers(){return [...records.keys()];},get walkReady(){return !!walk?.ready;},get walkingFrames(){return walk?walkFrames.length:0;},get retiringMember(){return retiring?.pose.member??null;},get retiringOpacity(){return retiring?1-retiring.age/.45:0;},get cachedWalkImages(){return (walk?.images.length??0)+(retiring?.record.images.length??0);},get walkMember(){return walk?.member??null;},get walkImageCount(){return walk?.images.length??0;},get follower(){return follower?{...follower}:null;}
};
})();
