(()=>{'use strict';
const canvas=document.getElementById('world');if(!canvas)return;
let anchors=[],record=null,lastScene='',visible=0;
const relevant=id=>['portal-city','asterum','eunho'].includes(id);
function prepare(){
 const scene=canvas.dataset.scene,entered=scene!==lastScene;lastScene=scene;
 if(!relevant(scene)){record?.image.removeAttribute('src');record=null;return;}
 if(record?.art||record?.pending||record&&!entered)return;
 const image=new Image(),next={image,art:null,pending:true};record=next;
 image.decoding='async';image.fetchPriority='low';image.src='assets/explore-eunho-npc-v1.png';
 image.decode().then(()=>{if(record===next)next.art=image;}).catch(()=>{}).finally(()=>next.pending=false);
}
new MutationObserver(prepare).observe(canvas,{attributes:true,attributeFilter:['data-scene']});prepare();
window.YitingActors={
 configure(items){anchors=items.filter(item=>Number.isFinite(item.x)&&item.x>=0).map(item=>({...item}));},
 draw(ctx,{id,w,h,camera,scale}){
  visible=0;const art=record?.art;if(!art)return;
  // Crop only transparent padding; preserve the entire physical silhouette.
  const crop={x:256,y:14,w:528,h:1507},height=h*.43,width=height*crop.w/crop.h,ground=h*.85;
  for(const actor of anchors){
   if(actor.scene!==id)continue;const cx=(actor.x-camera)*scale;
   if(cx+width/2<0||cx-width/2>w)continue;
   ctx.save();const shadow=ctx.createRadialGradient(cx,ground,0,cx,ground,width*.52);
   shadow.addColorStop(0,'#11152e66');shadow.addColorStop(1,'#11152e00');ctx.fillStyle=shadow;
   ctx.save();ctx.translate(cx,ground);ctx.scale(1,.18);ctx.translate(-cx,-ground);ctx.beginPath();ctx.arc(cx,ground,width*.52,0,Math.PI*2);ctx.fill();ctx.restore();
   ctx.imageSmoothingEnabled=true;ctx.drawImage(art,crop.x,crop.y,crop.w,crop.h,cx-width/2,ground-height,width,height);ctx.restore();visible++;
  }
 },get ready(){return !!record?.art;},get visible(){return visible;},get count(){return anchors.length;}
};
})();
