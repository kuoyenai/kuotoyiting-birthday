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
const following=index=>anchors.find(actor=>actor.member!=='concert'&&Number.isInteger(actor.followFrom)&&index>=actor.followFrom&&index<actor.followUntil);
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
 const companion=following(Number(canvas.dataset.index));if(companion&&!wanted.includes(companion.member))wanted.push(companion.member);
 for(const member of records.keys())if(!wanted.includes(member))discard(member);
 for(const member of wanted)load(member,entered&&member===current);
}
new MutationObserver(prepare).observe(canvas,{attributes:true,attributeFilter:['data-scene','data-index']});prepare();
window.YitingActors={
 configure(items){anchors=items.filter(item=>Number.isFinite(item.x)&&item.x>=0).map(item=>({...item}));followPositions.clear();prepare();},
 draw(ctx,{id,w,h,camera,scale,t=performance.now(),reduced=false,playerX=0,playerFacing=1,moving=false,dt=0,index=-1}){
  visible=0;const companion=following(index);
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
  // Only the character who has already met YiTing follows her to the next story location.
  // Use the original NPC illustration; this is a gentle motion treatment, not a new sprite animation.
  if(companion&&Number.isFinite(playerX)){
   const config=configs[companion.member],art=records.get(companion.member)?.art;
   if(config&&art){
    const desired=playerX-(playerFacing||1)*90,previous=followPositions.get(companion.member);
    const px=previous===undefined||Math.abs(previous-desired)>450?desired:previous+(desired-previous)*(1-Math.exp(-Math.max(0,dt)*5));
    followPositions.set(companion.member,px);
    const crop=config.crop,height=h*config.height,width=height*crop.w/crop.h,ground=h*.85,cx=(px-camera)*scale;
    if(cx+width>=0&&cx-width<=w){
     const bob=!reduced&&moving?Math.sin(t*.013)*Math.min(3,h*.005):0;
     ctx.save();ctx.globalAlpha*=.94;ctx.imageSmoothingEnabled=true;
     ctx.fillStyle='#11152e44';ctx.beginPath();ctx.ellipse(cx,ground,width*.24,height*.018,0,0,Math.PI*2);ctx.fill();
     ctx.drawImage(art,crop.x,crop.y,crop.w,crop.h,cx-width*(config.origin??.5),ground-height+bob,width,height);
     ctx.restore();visible++;
    }
   }
  }
 },get ready(){const scene=canvas.dataset.scene;return !!records.get(members[scene])?.art;},get visible(){return visible;},get count(){return anchors.length;},get cachedActors(){return records.size;},get cachedMembers(){return [...records.keys()];}
};
})();
