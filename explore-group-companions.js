(()=>{'use strict';
const canvas=document.getElementById('world');if(!canvas)return;
const members=['yejun','noah','bamby','eunho','hamin'];
const eunho={frames:[["assets/explore-eunho-walk-contact-a-v2.png",1464,72,570],["assets/explore-eunho-walk-pass-a-v2.png",1485,47,480],["assets/explore-eunho-walk-contact-b-v2.png",1466,60,570],["assets/explore-eunho-walk-pass-b-v2.png",1475,43,540],["assets/explore-eunho-side-idle-v2.png",1498,56,565]]};
const sets={...window.YitingCompanionPoses,eunho};
const standing={yejun:[10,50,1014,1436],noah:[262,15,660,1510],bamby:[195,8,588,1506],eunho:[256,14,528,1507],hamin:[144,7,830,1518]};
const formation=[{member:'yejun',offset:-.29},{member:'noah',offset:-.12},{member:'bamby',offset:.18},{member:'eunho',offset:.35},{member:'hamin',offset:.50}].map(slot=>({...slot,ground:.82,height:.37*((sets[slot.member].height??.43)/.43)}));
const records=new Map(),positions=new Map(),cohort=new Map(),cohortFrames=window.YitingCohortPoses||[];let previous='',visible=[],snapshots=[],started=0,groupX=null,groupPhase=0,groupDirection=1,groupFrame=-1,groupBounds=null;
function cohortReady(){return cohortFrames.length===5&&cohortFrames.every(p=>cohort.get(p[0])?.ready)}
function needFallback(){for(const member of members)load(member,false)}
function releaseFallback(){for(const r of records.values())for(const im of r.images.values())im.removeAttribute('src');records.clear()}
function loadCohort(retry){for(const pose of cohortFrames){const old=cohort.get(pose[0]);if(old&&(!retry||!old.failed))continue;old?.image.removeAttribute('src');const image=new Image(),record={image,ready:false,failed:false};cohort.set(pose[0],record);image.decoding='async';image.fetchPriority='low';image.src=pose[0];image.decode().then(()=>{if(cohort.get(pose[0])===record){record.ready=true;if(cohortReady())releaseFallback()}}).catch(()=>{if(cohort.get(pose[0])===record){record.failed=true;needFallback()}})}}
function release(){releaseFallback();for(const r of cohort.values())r.image.removeAttribute('src');cohort.clear();positions.clear();visible=[];snapshots=[];groupX=null;groupBounds=null;}
function fallback(r){if(r.fallback)return;const im=new Image();r.fallback=im;r.images.set('fallback',im);im.src={yejun:'assets/explore-yejun-npc-v1.png',noah:'assets/explore-noah-npc-v1.png',bamby:'assets/explore-bamby-npc-v1.png',eunho:'assets/explore-eunho-npc-v1.png',hamin:'assets/explore-hamin-npc-v1.png'}[r.member];im.decode().then(()=>r.standing=im).catch(()=>{});}
function load(member,retry){const old=records.get(member);if(old&&(!retry||!old.failed))return;if(old)for(const im of old.images.values())im.removeAttribute('src');const r={member,images:new Map(),decoded:new Set(),failed:false};records.set(member,r);for(const [name]of sets[member].frames){if(r.images.has(name))continue;const im=new Image();r.images.set(name,im);im.decoding='async';im.fetchPriority='low';im.src=name;im.decode().then(()=>{if(records.get(member)===r)r.decoded.add(name)}).catch(()=>{r.failed=true;fallback(r)});}}
function prepare(){const scene=canvas.dataset.scene,entered=scene!==previous;previous=scene;if(!['wish','farewell'].includes(scene)){release();return;}loadCohort(entered&&scene==='farewell');if([...cohort.values()].some(r=>r.failed))for(const member of members)load(member,entered&&scene==='farewell');if(entered){positions.clear();groupX=null;groupPhase=0;started=performance.now();}}
new MutationObserver(prepare).observe(canvas,{attributes:true,attributeFilter:['data-scene']});prepare();
function canDraw(r){return !!r&&(r.decoded.has(sets[r.member].frames[4][0])||!!r.standing)}
window.YitingGroupCompanions={
 get active(){return ['wish','farewell'].includes(canvas.dataset.scene)},
 get ready(){return canvas.dataset.scene==='wish'?canvas.dataset.celebrationReady==='true':cohortReady()||members.every(m=>canDraw(records.get(m)))},
 get includesPlayer(){return canvas.dataset.scene==='farewell'&&cohortReady()},get unifiedReady(){return cohortReady()},get unifiedFrame(){return groupFrame},get renderedBounds(){return groupBounds?{...groupBounds}:null},get failedCohortFrames(){return [...cohort].filter(([,r])=>r.failed).map(([name])=>name)},get failedMembers(){return [...records.values()].filter(r=>r.failed).map(r=>r.member)},get visibleMembers(){return [...visible]},get poses(){return snapshots.map(p=>({...p}))},get cachedImages(){return cohort.size+[...records.values()].reduce((n,r)=>n+r.images.size,0)},
 draw(ctx,{id,w,h,camera,scale,t,reduced,playerX,playerFacing,dt}){
  visible=[];snapshots=[];
  if(id==='wish'){if(canvas.dataset.celebrationReady==='true')visible=[...members];return;}
  if(id!=='farewell')return;
  if(cohortReady()){
   const maxRatio=Math.max(...cohortFrames.map(p=>1672/(p[1]-p[2]))),height=Math.min(h*.43,w*.94/maxRatio),distance=groupX===null?0:playerX-groupX,moving=!reduced&&dt>0&&Math.abs(distance)>.02,stride=height/scale*.6;groupX=playerX;
   if(moving){groupPhase=(groupPhase+Math.abs(distance)/stride)%1;groupDirection=Math.sign(distance)}else if(!reduced&&dt>0)groupDirection=playerFacing||groupDirection;
   groupFrame=moving?Math.floor(groupPhase*4):-1;const pose=cohortFrames[groupFrame>=0?groupFrame:4],image=cohort.get(pose[0]).image,unit=height/(pose[1]-pose[2]),ground=h*.85,iw=image.naturalWidth,origin=pose[3],direction=reduced?(playerFacing||1):groupDirection,leftExtent=(direction>0?origin:iw-origin)*unit,rightExtent=(direction>0?iw-origin:origin)*unit,cx=Math.max(leftExtent+4,Math.min(w-rightExtent-4,(playerX-camera)*scale));
   ctx.save();ctx.globalAlpha*=reduced?1:Math.min(1,Math.max(0,(t-started)/350));ctx.fillStyle='#11152e38';for(const x of [220,510,720,975,1220,1490]){ctx.beginPath();ctx.ellipse(cx+(x-origin)*unit*direction,ground,height*.065,height*.014,0,0,Math.PI*2);ctx.fill()}ctx.translate(cx,ground);ctx.scale(direction,1);ctx.drawImage(image,-origin*unit,-pose[1]*unit,iw*unit,image.naturalHeight*unit);ctx.restore();
   groupBounds={left:cx-leftExtent,right:cx+rightExtent,top:ground-height,bottom:ground};visible=[...members];const anchors={yejun:220,noah:510,bamby:720,eunho:1220,hamin:1490};snapshots=members.map(member=>({member,x:playerX+(anchors[member]-origin)*unit/scale*direction,phase:groupPhase,direction,frame:groupFrame,height,ground,stride}));return;
  }

  for(const slot of formation){const r=records.get(slot.member);if(!canDraw(r))continue;const height=Math.min(h*slot.height,w*.48),desired=playerX+slot.offset*w/scale,old=positions.get(slot.member),before=old?.x??desired,step=reduced?desired-before:Math.max(-300*Math.max(0,dt),Math.min(300*Math.max(0,dt),(desired-before)*(1-Math.exp(-Math.max(0,dt)*5)))),x=before+step,distance=x-before,stride=height/scale*.6,phase=((old?.phase??0)+Math.abs(distance)/stride)%1,moving=!reduced&&Math.abs(distance)>.04,direction=moving?Math.sign(distance):(playerFacing||1),frame=moving?Math.floor(phase*4):4;
   positions.set(slot.member,{x,phase});let pose=sets[slot.member].frames[frame],im=r.images.get(pose[0]);if(reduced||!r.decoded.has(pose[0])){pose=sets[slot.member].frames[4];im=r.images.get(pose[0]);}
   const cx=(x-camera)*scale,ground=h*slot.ground;ctx.save();ctx.globalAlpha*=reduced?1:Math.min(1,Math.max(0,(t-started)/350));ctx.fillStyle='#11152e38';ctx.beginPath();ctx.ellipse(cx,ground,height*.14,height*.018,0,0,Math.PI*2);ctx.fill();ctx.translate(cx,ground);ctx.scale(direction>0?1:-1,1);
   if(r.decoded.has(pose[0])){const unit=height/(pose[1]-pose[2]),crop=pose[4]??[0,0,im.naturalWidth,im.naturalHeight];ctx.drawImage(im,...crop,-pose[3]*unit,-pose[1]*unit,crop[2]*unit,crop[3]*unit)}else if(r.standing){const crop=standing[slot.member],width=height*crop[2]/crop[3];ctx.drawImage(r.standing,...crop,-width/2,-height,width,height)}
   ctx.restore();visible.push(slot.member);snapshots.push({member:slot.member,x,phase,direction,frame:moving?frame:-1,height,ground,stride});
  }
 }
};
})();
