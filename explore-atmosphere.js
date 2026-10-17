(()=>{'use strict';const canvas=document.getElementById('world');if(!canvas)return;
let artwork=null,pending=false,triedChapter=false,wasGarden=false;
function load(){if(artwork||pending)return;pending=true;const image=new Image();image.decoding='async';image.fetchPriority='low';image.src='assets/explore-garden-foreground-v1.png';image.decode().then(()=>{artwork=image;}).catch(()=>{}).finally(()=>pending=false);}
function prepare(){const garden=canvas.dataset.scene==='garden';if(document.body.dataset.chapter==='4'&&!triedChapter){triedChapter=true;load();}if(garden&&!wasGarden)load();wasGarden=garden;}
const observer=new MutationObserver(prepare);observer.observe(canvas,{attributes:true,attributeFilter:['data-scene']});observer.observe(document.body,{attributes:true,attributeFilter:['data-chapter']});prepare();
window.YitingAtmosphere={draw(ctx,{id,t,w,h,camera,reduced}){
 if(id!=='garden'||!artwork)return;
 const iw=artwork.naturalWidth,ih=artwork.naturalHeight,sw=iw*.28,top=ih*.42,bottom=ih*.34,size=Math.min(w*.23,h*.27,150);
 const shift=reduced?0:Math.sin(camera*.0018)*4,sway=reduced?0:Math.sin(t*.0005)*1.5;
 ctx.save();ctx.globalAlpha=.76;
 ctx.drawImage(artwork,0,0,sw,top,-4+shift,-3+sway,size,size*top/sw);
 ctx.drawImage(artwork,iw-sw,0,sw,top,w-size+4-shift,-3-sway,size,size*top/sw);
 ctx.drawImage(artwork,0,ih-bottom,sw,bottom,-4-shift,h-size*bottom/sw+3,size,size*bottom/sw);
 ctx.drawImage(artwork,iw-sw,ih-bottom,sw,bottom,w-size+4+shift,h-size*bottom/sw+3,size,size*bottom/sw);
 ctx.restore();
 },get ready(){return !!artwork;}};
})();
