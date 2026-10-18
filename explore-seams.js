(()=>{'use strict';
const cache=new Map();let builds=0;
function paint(context,region,image,left,scale,h,width){
 const sky=context.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#121b38');sky.addColorStop(1,'#332444');context.fillStyle=sky;context.fillRect(0,0,width,h);
 const tileWidth=h*image.naturalWidth/image.naturalHeight,worldTile=tileWidth/scale,first=Math.floor((left-region.start)/worldTile),last=Math.ceil((left+width/scale-region.start)/worldTile);
 for(let tile=first;tile<last;tile++){const px=(region.start+tile*worldTile-left)*scale;context.save();if(tile%2){context.translate(px+tileWidth,0);context.scale(-1,1);context.drawImage(image,0,0,tileWidth,h);}else context.drawImage(image,px,0,tileWidth,h);context.restore();}
}
window.YitingSeams={draw(ctx,{regions,images,camera,scale,h,w}){
 const wanted=new Set();for(let i=1;i<regions.length;i++){
  const boundary=regions[i].start,cx=(boundary-camera)*scale,width=Math.max(2,Math.ceil(48*scale));if(cx+width/2<0||cx-width/2>w)continue;
  const previous=regions[i-1],next=regions[i],a=images.get(previous.source),b=images.get(next.source);if(!a?.complete||!a.naturalWidth||!b?.complete||!b.naturalWidth)continue;
  wanted.add(i);const key=[width,h,scale,a.src,b.src].join('|');let entry=cache.get(i);
  if(!entry||entry.key!==key){
   const strip=document.createElement('canvas'),overlay=document.createElement('canvas');strip.width=overlay.width=width;strip.height=overlay.height=Math.ceil(h);const c=strip.getContext('2d'),o=overlay.getContext('2d'),left=boundary-width/(2*scale);
   paint(c,previous,a,left,scale,h,width);paint(o,next,b,left,scale,h,width);o.globalCompositeOperation='destination-in';const mask=o.createLinearGradient(0,0,width,0);mask.addColorStop(0,'#0000');mask.addColorStop(1,'#000');o.fillStyle=mask;o.fillRect(0,0,width,h);c.drawImage(overlay,0,0);entry={key,strip};cache.set(i,entry);builds++;
  }
  ctx.save();ctx.drawImage(entry.strip,cx-width/2,0);ctx.restore();
 }
 for(const i of cache.keys())if(!wanted.has(i))cache.delete(i);
},get cached(){return cache.size;},get builds(){return builds;}};
})();
