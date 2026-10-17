(()=>{'use strict';const canvas=document.getElementById('world');if(!canvas)return;
const configs={
 garden:{source:'assets/explore-garden-foreground-v1.png',next:'greenhouse',alpha:.76,scale:1},
 greenhouse:{source:'assets/explore-moon-foreground-v1.png',next:'eunho',alpha:.68,scale:.96,crop:{width:.38,top:.5,bottom:.44}},
 eunho:{source:'assets/explore-eunho-foreground-v1.png',alpha:.73,scale:.9,crop:{width:.38,top:.5,bottom:.44}}
};
const layers=new Map();let previousScene='';
function discard(id){const record=layers.get(id);layers.delete(id);record?.image.removeAttribute('src');}
function load(id,retry=false){
 const config=configs[id];if(!config)return;
 const old=layers.get(id);if(old&&(old.art||old.pending||!retry))return;if(old)discard(id);
 const image=new Image(),record={image,art:null,pending:true,started:null};layers.set(id,record);image.decoding='async';image.fetchPriority='low';image.src=config.source;
 image.decode().then(()=>{if(layers.get(id)===record)record.art=image;}).catch(()=>{}).finally(()=>record.pending=false);
}
function prepare(){
 const scene=canvas.dataset.scene,chapter=Number(document.body.dataset.chapter),entered=scene!==previousScene;
 let wanted=[];
 if(configs[scene])wanted=[scene,configs[scene].next].filter(Boolean);
 else if(scene==='asterum'&&chapter===4)wanted=['garden','greenhouse'];
 else if(scene==='plaza'||scene==='observatory')wanted=['eunho'];
 for(const id of layers.keys())if(!wanted.includes(id))discard(id);
 for(const id of wanted)load(id,entered&&id===scene);
 if(entered&&layers.has(scene))layers.get(scene).started=null;
 previousScene=scene;
}
const observer=new MutationObserver(prepare);observer.observe(canvas,{attributes:true,attributeFilter:['data-scene']});observer.observe(document.body,{attributes:true,attributeFilter:['data-chapter']});prepare();
window.YitingAtmosphere={draw(ctx,{id,t,w,h,camera,reduced}){
 const record=layers.get(id),artwork=record?.art,config=configs[id];if(!artwork||!config)return;
 if(record.started===null)record.started=t;
 const iw=artwork.naturalWidth,ih=artwork.naturalHeight,crop=config.crop||{width:.28,top:.42,bottom:.34},sw=iw*crop.width,top=ih*crop.top,bottom=ih*crop.bottom,size=Math.min(w*.23,h*.27,150)*config.scale;
 const shift=reduced?0:Math.sin(camera*.0018)*4,sway=reduced?0:Math.sin(t*.0005)*1.5,fade=reduced?1:Math.min(1,Math.max(0,(t-record.started)/500));
 ctx.save();ctx.globalAlpha=config.alpha*fade;
 ctx.drawImage(artwork,0,0,sw,top,-4+shift,-3+sway,size,size*top/sw);
 ctx.drawImage(artwork,iw-sw,0,sw,top,w-size+4-shift,-3-sway,size,size*top/sw);
 ctx.drawImage(artwork,0,ih-bottom,sw,bottom,-4-shift,h-size*bottom/sw+3,size,size*bottom/sw);
 ctx.drawImage(artwork,iw-sw,ih-bottom,sw,bottom,w-size+4+shift,h-size*bottom/sw+3,size,size*bottom/sw);
 ctx.restore();
 },get ready(){return !!layers.get(canvas.dataset.scene)?.art;},get cachedLayers(){return layers.size;}};
})();
