(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),dialog=$('story'),music=$('music');
const replacement={'novel-bamby-closeup':'E00F34EB-9BDE-4825-883E-9EA4E8C618A4.png','novel-welcome-teasing':'D8AF4512-1868-4624-95B9-9FEC559B6A0C.png'};
const chapters=window.YITING_NOVEL_CHAPTERS,route=[];
window.NOVEL_PANELS.forEach((panels,chapter)=>panels.forEach(([asset,narration,lines,star],panel)=>{route.push({asset,narration,lines,star,chapter,panel});(window.YITING_EXTRA_SHOTS||[]).filter(s=>s.chapter===chapter&&s.after===asset).forEach(s=>route.push({asset:s.asset,narration:s.narration,lines:[],chapter,sourcePanel:panel,panel:s.id}));}));
const key='yiting-explore-story-v1';let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
const valid=n=>Number.isInteger(n)&&n>=0&&n<=route.length;
let index=valid(saved.index)?saved.index:0,unlocked=valid(saved.unlocked)?saved.unlocked:0;
unlocked=Math.max(index,unlocked);
let x=180,target=180,waypoint=720,speed=0,facing=1,camera=0,vw=1600,last=0,walkPhase=0,motionBlend=0,muted=false,ready=false,line=0,backgroundToken=0;
const classicSprite=new Image();classicSprite.src='assets/explore-yiting-walk-v1.png';const classicFrames=[[28,18,250,705],[326,18,370,705],[677,18,310,705],[1000,18,410,705],[1400,18,345,705],[1790,18,250,705]];
let reviewIndex=null;let sceneStep=0,transitionUntil=0;const stageLength=960,starPosition=720;const starAt=n=>starPosition+n*stageLength;waypoint=starAt(index);x=target=Math.max(180,index===0?180:starAt(index-1));camera=Math.max(0,x-250);let background=new Image();const sceneImages=new Map();const keys=new Set(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const colors={blue:'#77baff',purple:'#c5a2ef',pink:'#f2a3c0',green:'#8dd2b0',red:'#e57291'};
const current=()=>route[index];const sceneForDisplay=()=>window.yitingExploreScene(current()||route[route.length-1]);const art=asset=>'assets/'+(replacement[asset]||asset+'.webp');
function save(){try{localStorage.setItem(key,JSON.stringify({index,unlocked,updated:Date.now()}));$('saveState').textContent='進度已保存在這個瀏覽器';}catch{$('saveState').textContent='瀏覽器無法保存進度，本次仍可繼續遊玩';}}
function stop(){keys.clear();target=x;speed=0;}
const playlist=window.YITING_TRACKS||[],stored=window.yitingMusicRead?.()||{index:0,paused:false};
let musicIndex=Number.isInteger(stored.index)&&stored.index>=0&&stored.index<playlist.length?stored.index:0;
muted=stored.paused===true;
music.loop=false;
if(playlist.length)music.src=playlist[musicIndex].src;
function audio(){if(!muted)music.play().catch(()=>{});}
function nextSong(){
 if(!playlist.length||muted)return;
 musicIndex=(musicIndex+1)%playlist.length;
 window.yitingMusicSave?.({index:musicIndex,paused:false});
 music.src=playlist[musicIndex].src;
 music.load();
 audio();
}
music.addEventListener('ended',nextSong);
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='yiting-explore-audio')return;if(event.data.action==='pause')music.pause();});
$('sound').textContent=muted?'音樂關閉':'音樂開啟';
$('sound').setAttribute('aria-pressed',String(!muted));
function theme(){return current()?.star||sceneForDisplay().color;}
function refresh(){const s=current(),done=!s;$("endLink").hidden=!done;document.body.dataset.chapter=String(s?.chapter??9);$('chapterName').textContent=done?'生日快樂，YiTing':chapters[s.chapter].title;$('objective').textContent=done?'妳已走完整段星光旅程。謝謝妳來到這個世界。':window.yitingExploreScene(s).hint;$('progress').textContent=(Math.min(index+1,route.length))+' / '+route.length+' · '+(done?'旅程完成':chapters[s.chapter].label);$('fiveStars').replaceChildren();for(const [color,name] of Object.entries({blue:'希望',purple:'溫柔',pink:'快樂',green:'勇氣',red:'陪伴'})){const badge=document.createElement('span'),owned=route.slice(0,unlocked).some(s=>s.star===color);badge.textContent=(owned?'✦ ':'· ')+name;badge.style.color=owned?colors[color]:'#73788a';badge.setAttribute('aria-label',name+(owned?'已收集':'尚未收集'));$('fiveStars').append(badge);}$('journeyProgress').max=route.length;$('journeyProgress').value=index;$('sceneLabel').textContent=sceneForDisplay().label;canvas.dataset.scene=sceneForDisplay().id;$('storyLink').href='novel-comic.html#chapter-'+(s?.chapter??9)+'-panel-'+(s?.panel??0);$('storyLink').hidden=done;
const near=nearbyStory();$('interact').disabled=!ready||near<0;$('interact').textContent=near<0?'走近星光':near<index?'✦ 重溫這段故事':'✦ 發現這段故事';canvas.dataset.index=String(index);canvas.dataset.playerX=String(Math.round(x));canvas.dataset.waypoint=String(waypoint);canvas.dataset.facing=String(facing);
$('chapterMenu').replaceChildren();chapters.forEach((chapter,c)=>{const option=document.createElement('option'),first=route.findIndex(s=>s.chapter===c);option.value=first;option.textContent=chapter.title+(first>unlocked?' · 尚未抵達':'');option.disabled=first>unlocked;option.selected=c===(s?.chapter??9);$('chapterMenu').append(option);});}
const sceneCache=new Map();function loadScene(source){if(!sceneCache.has(source)){const image=new Image();image.src=source;sceneCache.set(source,image.decode().then(()=>image).catch(error=>{sceneCache.delete(source);throw error;}));}return sceneCache.get(source);}
// Prepare neighboring map segments before the camera reaches them, without resetting movement.
function preloadWorldSegments(center=index){
 for(let n=Math.max(0,center-1);n<=Math.min(route.length-1,center+3);n++){
  const source=window.yitingExploreScene(route[n]).source;
  if(!sceneImages.has(source))loadScene(source).then(img=>sceneImages.set(source,img)).catch(()=>{});
 }
}
async function changeBackground(){const token=++backgroundToken,scene=sceneForDisplay();ready=false;stop();$('loading').hidden=false;$('loading').textContent='正在走進下一段風景…';try{const [image]=await Promise.all([loadScene(scene.source),classicSprite.decode()]);if(token!==backgroundToken)return;background=image;sceneImages.set(scene.source,image);preloadWorldSegments();ready=true;$('loading').hidden=true;refresh();preloadWorldSegments();const next=route[index+1];if(next)loadScene(window.yitingExploreScene(next).source).then(img=>sceneImages.set(window.yitingExploreScene(next).source,img)).catch(()=>{});}catch{if(token!==backgroundToken)return;$('loading').replaceChildren(document.createTextNode('場景暫時無法載入。'));const retry=document.createElement('button');retry.textContent='重新載入';retry.onclick=changeBackground;$('loading').append(retry);}}
function nearbyStory(){if(Math.abs(x-waypoint)<115&&current())return index;for(let n=Math.min(index-1,route.length-1);n>=0;n--){if(Math.abs(x-starAt(n))<115)return n;}return -1;}
function showLine(){const s=route[reviewIndex??index],rows=[['故事旁白',s.narration],...s.lines];$('speaker').textContent=rows[line][0];$('line').textContent=rows[line][1];$('continue').textContent=line<rows.length-1?'繼續 →':reviewIndex!==null?'結束重溫 →':index===route.length-1?'把星光帶回日常':'繼續旅程 →';}
function openStory(){const found=nearbyStory();if(found<0||!ready)return;stop();reviewIndex=found<index?found:null;line=0;const s=route[found],image=$('storyArt');image.src=art(s.asset);image.alt=s.narration;$('artStatus').textContent='';showLine();dialog.showModal();}
$('storyArt').onerror=()=>{$('artStatus').textContent='圖片暫時無法載入，輕觸此處重試';};$('artStatus').onclick=()=>{if(route[reviewIndex??index])$('storyArt').src=art(route[reviewIndex??index].asset)+'?retry='+Date.now();};$('storyArt').onload=()=>{$('artStatus').textContent='';};
$('continue').onclick=()=>{const s=route[reviewIndex??index];if(!s)return;if(line<s.lines.length){line++;showLine();return;}if(reviewIndex!==null){reviewIndex=null;dialog.close();refresh();return;}index++;unlocked=Math.max(unlocked,index);dialog.close();stop();sceneStep++;waypoint=starAt(index);target=x;save();refresh();preloadWorldSegments();const nextSource=sceneForDisplay().source;if(!sceneImages.has(nextSource))changeBackground();else {background=sceneImages.get(nextSource);ready=true;const ahead=route[index+1];if(ahead){const src=window.yitingExploreScene(ahead).source;loadScene(src).then(img=>sceneImages.set(src,img)).catch(()=>{});}}if(!current()){$('endLink').hidden=false;refresh();}};
$('interact').onclick=()=>{if(!$('interact').disabled)openStory();};dialog.addEventListener('close',()=>{canvas.focus({preventScroll:true});});
canvas.addEventListener('pointerdown',e=>{if(!ready||dialog.open)return;const r=canvas.getBoundingClientRect();target=Math.max(80,Math.min(waypoint,camera+(e.clientX-r.left)/r.width*vw));audio();canvas.focus({preventScroll:true});});
window.addEventListener('keydown',e=>{if(dialog.open||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('button,a,select'))return;const k=e.key.toLowerCase();if(['arrowleft','arrowright','a','d'].includes(k)){e.preventDefault();keys.add(k);audio();}if(k==='e')$('interact').click();});window.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());if(!keys.size)target=x;});window.addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
for(const [id,key]of[['left','arrowleft'],['right','arrowright']]){const b=$(id);b.addEventListener('pointerdown',e=>{if(dialog.open||!current())return;e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(key);audio();});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{keys.delete(key);target=x;});}
$('sound').onclick=()=>{muted=!muted;window.yitingMusicSave?.({index:musicIndex,paused:muted});if(muted)music.pause();else audio();$('sound').textContent=muted?'音樂關閉':'音樂開啟';$('sound').setAttribute('aria-pressed',String(!muted));};
$('chapterMenu').onchange=()=>{const next=Number($('chapterMenu').value);if(!valid(next)||next>unlocked)return;stop();index=next;x=target=Math.max(180,starAt(index-1));camera=Math.max(0,x-250);waypoint=starAt(index);$('endLink').hidden=true;save();refresh();changeBackground();};
$('restart').onclick=()=>{$('restartDialog').showModal();};$('cancelRestart').onclick=()=>$('restartDialog').close();$('confirmRestart').onclick=()=>{$('restartDialog').close();stop();index=0;unlocked=0;x=target=180;camera=0;waypoint=starAt(0);$('endLink').hidden=true;save();refresh();changeBackground();};

// Lightweight scene dressing: each discovered star advances the environment
// without requiring a duplicate background image or changing the character artwork.
function drawContinuousWorld(scale,h){
 const first=Math.max(0,Math.floor(camera/stageLength)-1),last=Math.min(route.length-1,Math.ceil((camera+vw)/stageLength)+1);
 for(let n=first;n<=last;n++){
  const scene=window.yitingExploreScene(route[n]),img=sceneImages.get(scene.source);
  const left=(n*stageLength-camera)*scale,width=stageLength*scale+1;
  if(img&&img.complete&&img.naturalWidth){
   // Match the right edge of each illustrated scene to the next without moving the player.
   const srcW=img.naturalWidth,srcH=img.naturalHeight;
   ctx.drawImage(img,0,0,srcW,srcH,left,0,width,h);
  }else{const sky=ctx.createLinearGradient(left,0,left,h);sky.addColorStop(0,'#121b38');sky.addColorStop(1,'#332444');ctx.fillStyle=sky;ctx.fillRect(left,0,width,h);}
  if(n>0){const fade=ctx.createLinearGradient(left,0,left+Math.min(width*.22,100),0);fade.addColorStop(0,'rgba(19,23,48,.32)');fade.addColorStop(1,'rgba(19,23,48,0)');ctx.fillStyle=fade;ctx.fillRect(left,0,Math.min(width*.22,100),h);}
 }
}
function drawSceneDetails(t,w,h,scale){
 const scene=sceneForDisplay(),tone=colors[theme()]||'#e7c9a4';
 const seed=sceneStep+index*3,drift=reduced?0:t*.00022;
 ctx.save();
 const haze=ctx.createLinearGradient(0,0,0,h);
 haze.addColorStop(0,'rgba(12,18,43,0)');haze.addColorStop(.74,tone+'0b');haze.addColorStop(1,tone+'26');
 ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);
 if(!reduced){for(let i=0;i<20;i++){
 const world=((i*173+seed*67)%960)+Math.floor(camera/960)*960,px=(world-camera*.78)*scale;
 const py=h*(.15+((i*7+seed)%13)/19)+Math.sin(drift+i*2)*4;
 if(px<0||px>w)continue;
 ctx.globalAlpha=.22+.22*Math.sin(drift*2+i)**2;
 ctx.fillStyle=i%4===0?'#fff8e8':tone;ctx.beginPath();ctx.arc(px,py,1.2+(i%3)*.8,0,Math.PI*2);ctx.fill();
 }ctx.globalAlpha=1;}
 // Ground lights guide the player toward the next story beat.
 for(let i=0;i<8;i++){
 const wx=320+i*110+Math.floor(camera/960)*960,px=(wx-camera)*scale;
 if(px<0||px>w)continue;
 ctx.globalAlpha=.12+.09*Math.sin(drift*4+i)**2;
 ctx.fillStyle=tone;ctx.beginPath();ctx.ellipse(px,h*.847,14*scale,3*scale,0,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}

let lastUpdate=0;function draw(t){const dt=Math.min((t-last)/1000||0,.04);last=t;const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);vw=Math.min(1600,900*w/h);const scale=w/vw;const cameraTarget=Math.max(0,x-vw*.4);camera=reduced?cameraTarget:camera+(cameraTarget-camera)*(1-Math.exp(-dt*8));if(ready){const dir=keys.has('arrowright')||keys.has('d')?1:keys.has('arrowleft')||keys.has('a')?-1:0;if(dir)target=Math.max(80,Math.min(waypoint,x+dir*160));target=Math.min(waypoint,target);const distance=target-x,desired=!dialog.open&&!$('restartDialog').open&&Math.abs(distance)>3?Math.sign(distance)*Math.min(210,Math.abs(distance)*4):0;speed+=(desired-speed)*(1-Math.exp(-dt*12));x=Math.max(80,Math.min(waypoint,x+speed*dt));motionBlend+=(Math.min(1,Math.abs(speed)/90)-motionBlend)*(1-Math.exp(-dt*10));walkPhase=(walkPhase+Math.abs(speed)*dt/(h*.39/scale*.6))%1;if(Math.abs(speed)>8)facing=Math.sign(speed);canvas.dataset.motionFrame=String(Math.floor(walkPhase*60));canvas.dataset.motionBlend=motionBlend.toFixed(3);
drawContinuousWorld(scale,h);drawSceneDetails(t,w,h,scale);const ground=h*.85,color=colors[theme()]||'#edcd8c';ctx.save();ctx.translate((waypoint-camera)*scale,ground-120*scale);ctx.shadowColor=color;ctx.shadowBlur=25;ctx.fillStyle=color;ctx.font=`${45*scale*(reduced?1:1+Math.sin(t*.003)*.1)}px serif`;ctx.textAlign='center';if(current())ctx.fillText('✦',0,0);for(let n=Math.max(0,Math.floor((camera-120)/stageLength));n<index&&n<route.length&&starAt(n)<camera+vw+120;n++){ctx.fillStyle='#b8c7e5';ctx.globalAlpha=.6;ctx.fillText('✧',(starAt(n)-camera)*scale,0);}ctx.restore();ctx.save();ctx.translate((x-camera)*scale,ground);ctx.scale(1,.2);const shadow=ctx.createRadialGradient(0,0,0,0,0,h*.065);shadow.addColorStop(0,'#080b2266');shadow.addColorStop(1,'#080b2200');ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,h*.065,0,Math.PI*2);ctx.fill();ctx.restore();window.YitingFootsteps.draw(ctx,{id:sceneForDisplay().id,phase:walkPhase,amount:motionBlend,x,camera,scale,height:h*.39,ground,facing,dt,reduced});canvas.dataset.footContacts=String(window.YitingFootsteps.contacts);const frameIndex=Math.abs(speed)>8?1+Math.floor(walkPhase*4)%4:0;const [sx,sy,sw,sh]=classicFrames[frameIndex],size=h*.39/705;ctx.save();ctx.translate((x-camera)*scale,ground);ctx.scale(facing,1);ctx.drawImage(classicSprite,sx,sy,sw,sh,-sw*size/2,-sh*size,sw*size,sh*size);ctx.restore();if(!reduced){ctx.fillStyle=color+'99';for(let i=0;i<16;i++)ctx.fillRect(((i*109+t*.008+Math.floor(camera/1600)*1600)%1600+Math.floor(camera/1600)*1600-camera)*scale,h*(.12+(i%6)*.1),1.5,1.5);}if(t-lastUpdate>100){lastUpdate=t;const near=nearbyStory();$('interact').disabled=!ready||near<0;$('interact').textContent=near<0?'走近星光':near<index?'✦ 重溫這段故事':'✦ 發現這段故事';canvas.dataset.playerX=String(Math.round(x));canvas.dataset.facing=String(facing);}}
if(t<transitionUntil){ctx.fillStyle='rgba(10,15,35,'+(Math.max(0,(transitionUntil-t)/720)*.9)+')';ctx.fillRect(0,0,w,h);}requestAnimationFrame(draw);}
refresh();changeBackground();requestAnimationFrame(draw);
})();



// Suppress iOS selection/callout only on play controls; story text stays selectable.
(()=>{for(const element of document.querySelectorAll('.controls,#world,#interact')){element.addEventListener('contextmenu',event=>event.preventDefault());element.addEventListener('selectstart',event=>event.preventDefault());}})();

