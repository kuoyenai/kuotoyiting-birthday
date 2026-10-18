(()=>{'use strict';
const canvas=document.getElementById('world');if(!canvas)return;
const source='assets/explore-plave-welcome-group-v1.png',members=['eunho','yejun','noah','bamby','hamin'];
let range=null,record=null,previous='',visible=false,bounds=null;
function discard(){record?.image.removeAttribute('src');record=null;visible=false;bounds=null;}
function prepare(){const id=canvas.dataset.scene,entered=id!==previous;previous=id;if(!['portal-city','asterum'].includes(id)){discard();return;}if(record&&(!record.failed||!entered))return;discard();const image=new Image(),next={image,ready:false,failed:false};record=next;image.decoding='async';image.fetchPriority='low';image.src=source;image.decode().then(()=>{if(record===next)next.ready=true;}).catch(()=>{if(record===next)next.failed=true;});}
new MutationObserver(prepare).observe(canvas,{attributes:true,attributeFilter:['data-scene']});prepare();
const active=(id,x)=>id==='asterum'&&record?.ready&&range&&x>=range.start&&x<range.end;
window.YitingWelcomeParty={
 configure(config){range=config;},active,
 draw(ctx,{id,w,h,camera,scale,playerX,reduced,t}){
  visible=false;bounds=null;if(!active(id,playerX))return false;
  // Crop transparent padding only; the full five-person silhouette is retained.
  const crop={x:245,y:16,w:1191,h:910},height=Math.min(h*.4,w*.7/(crop.w/crop.h)),width=height*crop.w/crop.h,unit=height/crop.h,ground=h*.85;
  const player=(playerX-camera)*scale,cx=Math.min(w-width/2-6,Math.max(width/2+6,player+width/2+38)),left=cx-width/2;
  const fade=reduced?1:Math.min(1,Math.max(0,(playerX-range.start)/100));ctx.save();ctx.globalAlpha*=fade;ctx.fillStyle='#10162d44';
  for(const [x,y]of [[460,923],[675,910],[895,898],[1100,910],[1290,896]]){ctx.beginPath();ctx.ellipse(left+(x-crop.x)*unit,ground-(926-y)*unit,height*.055,height*.012,0,0,Math.PI*2);ctx.fill();}
  ctx.drawImage(record.image,crop.x,crop.y,crop.w,crop.h,left,ground-height,width,height);ctx.restore();visible=fade>0;bounds={left,right:left+width,top:ground-height,bottom:ground};return true;
 },
 get ready(){return !!record?.ready;},get failed(){return !!record?.failed;},get cachedImages(){return record?1:0;},get visibleMembers(){return visible?[...members]:[];},get renderedBounds(){return bounds?{...bounds}:null;}
};
})();
