(()=>{'use strict';
const canvas=document.getElementById('world');if(!canvas)return;
const configs={
 eunho:{source:'assets/explore-eunho-npc-v1.png',crop:{x:256,y:14,w:528,h:1507},height:.43},
 yejun:{source:'assets/explore-yejun-npc-v1.png',crop:{x:10,y:50,w:1014,h:1436},height:.36},
 noah:{source:'assets/explore-noah-npc-v1.png',crop:{x:262,y:15,w:660,h:1510},height:.42,origin:.39},
 bamby:{source:'assets/explore-bamby-npc-v1.png',crop:{x:195,y:8,w:588,h:1506},height:.41,origin:.59},
 hamin:{source:'assets/explore-hamin-npc-v1.png',crop:{x:144,y:7,w:830,h:1518},height:.435,origin:.4}
};
const members={asterum:'eunho',eunho:'eunho',garden:'yejun',greenhouse:'noah',plaza:'bamby',observatory:'hamin'},records=new Map();
const preloads={'portal-city':['eunho'],asterum:['eunho','yejun'],garden:['yejun','noah'],greenhouse:['noah','bamby'],plaza:['bamby','hamin'],observatory:['hamin','eunho']};
let anchors=[],lastScene='',visible=0;
function discard(member){records.get(member)?.image.removeAttribute('src');records.delete(member);}
function load(member,retry){
 const old=records.get(member);if(old&&(old.art||old.pending||!retry))return;if(old)discard(member);
 const image=new Image(),next={image,art:null,pending:true};records.set(member,next);
 image.decoding='async';image.fetchPriority='low';image.src=configs[member].source;
 image.decode().then(()=>{if(records.get(member)===next)next.art=image;}).catch(()=>{}).finally(()=>next.pending=false);
}
function prepare(){
 const scene=canvas.dataset.scene,entered=scene!==lastScene;lastScene=scene;
 const current=members[scene],wanted=preloads[scene]??(current?[current]:[]);
 for(const member of records.keys())if(!wanted.includes(member))discard(member);
 for(const member of wanted)load(member,entered&&member===current);
}
new MutationObserver(prepare).observe(canvas,{attributes:true,attributeFilter:['data-scene']});prepare();
window.YitingActors={
 configure(items){anchors=items.filter(item=>Number.isFinite(item.x)&&item.x>=0).map(item=>({...item}));},
 draw(ctx,{id,w,h,camera,scale}){
  visible=0;const member=members[id],art=records.get(member)?.art,config=configs[member];if(!art||!config)return;
  // Crop only transparent padding; preserve the entire physical silhouette.
  const crop=config.crop,height=h*config.height,width=height*crop.w/crop.h,ground=h*.85;
  for(const actor of anchors){
   if(actor.scene!==id||actor.member!==member)continue;const cx=(actor.x-camera)*scale;
   if(cx+width/2<0||cx-width/2>w)continue;
   ctx.save();const shadow=ctx.createRadialGradient(cx,ground,0,cx,ground,width*.52);
   shadow.addColorStop(0,'#11152e66');shadow.addColorStop(1,'#11152e00');ctx.fillStyle=shadow;
   ctx.save();ctx.translate(cx,ground);ctx.scale(1,.18);ctx.translate(-cx,-ground);ctx.beginPath();ctx.arc(cx,ground,width*.52,0,Math.PI*2);ctx.fill();ctx.restore();
   ctx.imageSmoothingEnabled=true;ctx.drawImage(art,crop.x,crop.y,crop.w,crop.h,cx-width*(config.origin??.5),ground-height,width,height);ctx.restore();visible++;
  }
 },get ready(){return !!records.get(members[canvas.dataset.scene])?.art;},get visible(){return visible;},get count(){return anchors.length;},get cachedActors(){return records.size;},get cachedMembers(){return [...records.keys()];}
};
})();
