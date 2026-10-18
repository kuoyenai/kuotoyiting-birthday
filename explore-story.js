(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),dialog=$('story'),music=$('music');
const replacement={'novel-bamby-closeup':'E00F34EB-9BDE-4825-883E-9EA4E8C618A4.png','novel-welcome-teasing':'D8AF4512-1868-4624-95B9-9FEC559B6A0C.png'};
const chapters=window.YITING_NOVEL_CHAPTERS,route=[];
window.NOVEL_PANELS.forEach((panels,chapter)=>panels.forEach(([asset,narration,lines,star],panel)=>{route.push({asset,narration,lines,star,chapter,panel});(window.YITING_EXTRA_SHOTS||[]).filter(s=>s.chapter===chapter&&s.after===asset).forEach(s=>route.push({asset:s.asset,narration:s.narration,lines:[],chapter,sourcePanel:panel,panel:s.id}));}));
const readingSaveNotice=document.createElement('p');readingSaveNotice.id='storySaveStatus';readingSaveNotice.hidden=true;readingSaveNotice.setAttribute('role','status');$('continue').before(readingSaveNotice);
document.querySelector('.stage').append($('saveState'));$('saveState').setAttribute('role','status');
const key='yiting-explore-story-v1';let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
const valid=n=>Number.isInteger(n)&&n>=0&&n<=route.length;
let index=valid(saved.index)?saved.index:0,unlocked=valid(saved.unlocked)?saved.unlocked:0;
unlocked=Math.max(index,unlocked);
let resumeReading=saved.reading&&typeof saved.reading.asset==='string'&&Number.isInteger(saved.reading.line)&&saved.reading.line>=0?{asset:saved.reading.asset,line:saved.reading.line}:null;
let x=180,target=180,waypoint=720,speed=0,facing=1,camera=0,vw=1600,last=0,walkPhase=0,motionBlend=0,muted=false,ready=false,line=0,backgroundToken=0;
const classicSprite=new Image();classicSprite.src='assets/explore-yiting-walk-v1.png';const classicFrames=[[28,18,250,705],[326,18,370,705],[677,18,310,705],[1000,18,410,705],[1400,18,345,705],[1790,18,250,705]];
let reviewIndex=null;
// Version 2 keeps every story node, but makes walking between stars less repetitive.
// Old saves use 960-unit intervals; migrate their position once without changing story progress.
const mapVersion=2,oldStageLength=960,oldStarPosition=720,stageLength=400,starPosition=280;
const starAt=n=>starPosition+n*stageLength;
const migratePosition=oldX=>oldX<=180?oldX:oldX<=oldStarPosition?180+(oldX-180)*(starPosition-180)/(oldStarPosition-180):starPosition+(oldX-oldStarPosition)*stageLength/oldStageLength;
const worldLength=route.length*stageLength,worldRight=worldLength-80;
const movementLimit=()=>Math.min(worldRight,waypoint);
waypoint=starAt(index);
const savedPosition=Number.isFinite(saved.x)?(saved.mapVersion===mapVersion?saved.x:migratePosition(saved.x)):Math.max(180,index===0?180:starAt(index-1));
x=target=Math.max(80,Math.min(movementLimit(),savedPosition));let lastSavedX=x,lastPositionSave=0;camera=Math.max(0,x-250);const sceneImages=new Map();const keys=new Set(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const colors={blue:'#77baff',purple:'#c5a2ef',pink:'#f2a3c0',green:'#8dd2b0',red:'#e57291',gold:'#e7c789'};
const current=()=>route[index];const sceneForDisplay=()=>window.yitingExploreScene(route[Math.max(0,Math.min(route.length-1,Math.floor(x/stageLength)))]);const art=asset=>'assets/'+(replacement[asset]||asset+'.webp');
function save(){try{localStorage.setItem(key,JSON.stringify({mapVersion,index,unlocked,x,reading:resumeReading,updated:Date.now()}));lastSavedX=x;readingSaveNotice.hidden=true;readingSaveNotice.textContent='';delete $('saveState').dataset.failed;$('saveState').textContent='位置與閱讀進度已保存在這個瀏覽器';}catch{if(!$('saveState').dataset.failed){$('saveState').textContent='瀏覽器目前無法保存進度；本次仍可繼續，下次可能從較早的位置接續。';readingSaveNotice.textContent='這段暫時無法保存，下次可能需要重新閱讀；本次仍可繼續。';}$('saveState').dataset.failed='true';readingSaveNotice.hidden=false;}}
function stop(){keys.clear();target=x;speed=0;if(ready&&Math.abs(x-lastSavedX)>1)save();}const modalOpen=()=>!!document.querySelector('dialog[open]');window.addEventListener('yiting-explore-modal',stop);
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
music.addEventListener('ended',nextSong);window.yitingExploreResumeAudio=audio;
window.addEventListener('message',event=>{if(event.origin!==location.origin||event.data?.type!=='yiting-explore-audio')return;if(event.data.action==='pause')music.pause();});
$('sound').textContent=muted?'音樂關閉':'音樂開啟';
$('sound').setAttribute('aria-pressed',String(!muted));
const storyArtCache=new Map();let storyArtToken=0;
function warmStoryArt(center=index){
 const sources=route.slice(center,center+3).map(shot=>art(shot.asset)),keep=new Set(sources);
 for(const [source,image]of storyArtCache)if(!keep.has(source)){storyArtCache.delete(source);image.removeAttribute('src');}
 for(const source of sources)if(!storyArtCache.has(source)){const image=new Image();image.decoding='async';image.fetchPriority='low';storyArtCache.set(source,image);image.src=source;image.decode().catch(()=>{if(storyArtCache.get(source)===image)storyArtCache.delete(source);});}
}
function loadStoryArt(shot,{fallback=false,retry=false}={}){
 const image=$('storyArt'),frame=image.parentElement,hint=$('storyArtStatus'),token=++storyArtToken;
 if(fallback)image.dataset.fallback='1';else delete image.dataset.fallback;
 frame.dataset.loading='true';image.setAttribute('aria-busy','true');delete frame.dataset.failed;image.classList.add('is-loading');hint.hidden=false;hint.textContent='正在翻開這一格插畫…';
 image.onload=()=>{if(token!==storyArtToken)return;frame.dataset.loading='false';image.setAttribute('aria-busy','false');image.classList.remove('is-loading');hint.hidden=true;hint.textContent='';if(!fallback)$('artStatus').textContent='';};
 image.onerror=()=>{if(token!==storyArtToken)return;if(!fallback){$('artStatus').textContent='此格插畫尚未載入，先以場景背景呈現；輕觸可重試';loadStoryArt(shot,{fallback:true});return;}frame.dataset.loading='false';image.setAttribute('aria-busy','false');frame.dataset.failed='true';hint.textContent='插畫暫時無法載入，仍可繼續閱讀。';$('artStatus').textContent='圖片暫時無法載入，輕觸此處重試';};
 image.src=(fallback?window.yitingExploreScene(shot).source:art(shot.asset))+(retry?'?retry='+Date.now():'');
}
function rememberedLine(shot){return shot&&resumeReading&&resumeReading.asset===shot.asset&&resumeReading.line<=shot.lines.length?resumeReading.line:0;}
function interactionLabel(near){return near<0?(current()?'下一道星光在右方 →':'旅程完成 · 回頭重溫'):rememberedLine(route[near])>0?'✦ 接續上次閱讀':near<index?'✦ 重溫這段故事':'✦ 發現這段故事';}
function theme(){return current()?.star||sceneForDisplay().color;}
function refresh(){const s=current(),done=!s;$("endLink").hidden=!done;document.body.dataset.chapter=String(s?.chapter??9);$('chapterName').textContent=done?'生日快樂，YiTing':chapters[s.chapter].title;$('objective').textContent=done?'妳已走完整段星光旅程。謝謝妳來到這個世界。':window.yitingExploreScene(s).hint;$('chapterKicker').textContent=(done||s.chapter===9?'10:21 PM · ':'10:20 PM · ')+(done?'THE STARLIGHT JOURNEY':chapters[s.chapter].kicker);$('progress').textContent=(Math.min(index+1,route.length))+' / '+route.length+' · '+(done?'旅程完成':chapters[s.chapter].label);$('fiveStars').replaceChildren();for(const [color,name] of Object.entries({blue:'希望',purple:'溫柔',pink:'快樂',green:'勇氣',red:'陪伴'})){const badge=document.createElement('span'),owned=route.slice(0,unlocked).some(s=>s.star===color);badge.textContent=(owned?'✦ ':'· ')+name;badge.style.color=owned?colors[color]:'#73788a';badge.setAttribute('aria-label',name+(owned?'已收集':'尚未收集'));$('fiveStars').append(badge);}$('journeyProgress').max=route.length;$('journeyProgress').value=index;$('sceneLabel').textContent=sceneForDisplay().label;canvas.dataset.scene=sceneForDisplay().id;document.querySelector('.stage').setAttribute('aria-label',sceneForDisplay().label);$('storyLink').href='novel-comic.html#chapter-'+(s?.chapter??9)+'-panel-'+(s?.panel??0);$('storyLink').hidden=done;
const near=nearbyStory();$('interact').disabled=!ready||near<0;$('interact').textContent=interactionLabel(near);canvas.dataset.index=String(index);canvas.dataset.mapVersion=String(mapVersion);canvas.dataset.stageLength=String(stageLength);canvas.dataset.keepsake=String(route.slice(0,unlocked).some(s=>s.asset==='novel-star-closeup'));canvas.dataset.playerX=String(Math.round(x));canvas.dataset.waypoint=String(waypoint);canvas.dataset.facing=String(facing);
$('chapterMenu').replaceChildren();chapters.forEach((chapter,c)=>{const option=document.createElement('option'),first=route.findIndex(s=>s.chapter===c);option.value=first;option.textContent=chapter.title+(first>unlocked?' · 尚未抵達':'');option.disabled=first>unlocked;option.selected=c===(s?.chapter??9);$('chapterMenu').append(option);});if(ready)warmStoryArt();}
const sceneCache=new Map();function loadScene(source){if(!sceneCache.has(source)){const image=new Image();image.src=source;sceneCache.set(source,image.decode().then(()=>image).catch(error=>{sceneCache.delete(source);throw error;}));}return sceneCache.get(source);}
// Prepare neighboring map segments before the camera reaches them, without resetting movement.
function preloadWorldSegments(center=index){
 for(let n=Math.max(0,center-1);n<=Math.min(route.length-1,center+3);n++){
  const source=window.yitingExploreScene(route[n]).source;
  if(!sceneImages.has(source))loadScene(source).then(img=>sceneImages.set(source,img)).catch(()=>{});
 }
}
async function changeBackground(){const token=++backgroundToken,scene=sceneForDisplay();ready=false;stop();$('loading').hidden=false;$('loading').textContent='正在走進下一段風景…';try{const [image]=await Promise.all([loadScene(scene.source),classicSprite.decode()]);if(token!==backgroundToken)return;sceneImages.set(scene.source,image);preloadWorldSegments();ready=true;$('loading').hidden=true;refresh();preloadWorldSegments();const next=route[index+1];if(next)loadScene(window.yitingExploreScene(next).source).then(img=>sceneImages.set(window.yitingExploreScene(next).source,img)).catch(()=>{});}catch{if(token!==backgroundToken)return;/* Missing scene art should not prevent finishing the novel. */try{await classicSprite.decode();}catch{$('loading').textContent='角色圖片暫時無法載入，請重新整理遊戲。';return;}ready=true;$('loading').hidden=true;refresh();preloadWorldSegments();}}
function nearbyStory(){if(Math.abs(x-waypoint)<115&&current())return index;for(let n=Math.min(index-1,route.length-1);n>=0;n--){if(Math.abs(x-starAt(n))<115)return n;}return -1;}
function showLine(){const s=route[reviewIndex??index],rows=[['故事旁白',s.narration],...s.lines];$('speaker').textContent=rows[line][0];$('line').textContent=rows[line][1];$('continue').textContent=line<rows.length-1?'繼續 →':reviewIndex!==null?'結束重溫 →':index===route.length-1?'把星光帶回日常':'繼續旅程 →';resumeReading={asset:s.asset,line};save();}
function openStory(){const found=nearbyStory();if(found<0||!ready)return;audio();stop();reviewIndex=found<index?found:null;const s=route[found];line=rememberedLine(s);$('storyArt').alt=s.narration;$('artStatus').textContent='';warmStoryArt(found);loadStoryArt(s);showLine();dialog.showModal();}
$('artStatus').onclick=()=>{const shot=route[reviewIndex??index];if(shot)loadStoryArt(shot,{retry:true});};
$('continue').onclick=()=>{if(!dialog.open)return;audio();const s=route[reviewIndex??index];if(!s)return;if(line<s.lines.length){line++;showLine();return;}resumeReading=null;if(reviewIndex!==null){reviewIndex=null;dialog.close();save();refresh();return;}index++;unlocked=Math.max(unlocked,index);dialog.close();stop();waypoint=starAt(index);target=x;save();refresh();preloadWorldSegments();const nextSource=sceneForDisplay().source;if(!sceneImages.has(nextSource))changeBackground();else {ready=true;const ahead=route[index+1];if(ahead){const src=window.yitingExploreScene(ahead).source;loadScene(src).then(img=>sceneImages.set(src,img)).catch(()=>{});}}if(!current()){$('endLink').hidden=false;refresh();}};
$('interact').onclick=()=>{if(!$('interact').disabled)openStory();};dialog.addEventListener('close',()=>{if(!dialog.open)storyArtToken++;canvas.focus({preventScroll:true});});
canvas.addEventListener('pointerdown',e=>{if(!ready||modalOpen())return;const r=canvas.getBoundingClientRect();target=Math.max(80,Math.min(movementLimit(),camera+(e.clientX-r.left)/r.width*vw));audio();canvas.focus({preventScroll:true});});
window.addEventListener('keydown',e=>{if(modalOpen()||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('button,a,select'))return;const k=e.key.toLowerCase();if(['arrowleft','arrowright','a','d'].includes(k)){e.preventDefault();keys.add(k);audio();}if(k==='e')$('interact').click();});window.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());if(!keys.size)target=x;});window.addEventListener('blur',stop);window.addEventListener('pagehide',stop);window.addEventListener('resize',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
for(const [id,key]of[['left','arrowleft'],['right','arrowright']]){const b=$(id);b.addEventListener('pointerdown',e=>{if(modalOpen()||!ready)return;e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(key);audio();});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{keys.delete(key);target=x;});}
$('sound').onclick=()=>{muted=!muted;window.yitingMusicSave?.({index:musicIndex,paused:muted});if(muted)music.pause();else audio();$('sound').textContent=muted?'音樂關閉':'音樂開啟';$('sound').setAttribute('aria-pressed',String(!muted));};
$('chapterMenu').onchange=()=>{const next=Number($('chapterMenu').value);if(!valid(next)||next>unlocked)return;stop();index=next;x=target=Math.max(180,starAt(index-1));camera=Math.max(0,x-250);waypoint=starAt(index);$('endLink').hidden=true;save();refresh();changeBackground();};
$('restart').onclick=()=>{$('restartDialog').showModal();};$('cancelRestart').onclick=()=>$('restartDialog').close();$('confirmRestart').onclick=()=>{$('restartDialog').close();stop();resumeReading=null;index=0;unlocked=0;x=target=180;camera=0;waypoint=starAt(0);$('endLink').hidden=true;save();refresh();changeBackground();};

// Lightweight scene dressing: each discovered star advances the environment
// without requiring a duplicate background image or changing the character artwork.
// Consecutive story nodes share one environment strip; narrative coordinates stay unchanged.
const worldRegions=[];
route.forEach((story,n)=>{const source=window.yitingExploreScene(story).source,last=worldRegions.at(-1);if(last?.source===source)last.end=(n+1)*stageLength;else worldRegions.push({source,start:n*stageLength,end:(n+1)*stageLength});});
window.YitingPassages?.configure([3,9].map(chapter=>({x:route.findIndex(story=>story.chapter===chapter)*stageLength,returning:chapter===9})));
const actorAnchors=[
 {asset:'novel-arrival-medium',scene:'asterum',member:'eunho'},
 {asset:'novel-eunho-conversation',scene:'eunho',member:'eunho'},
 {asset:'novel-yejun-listening',scene:'garden',member:'yejun',offset:180},
 {asset:'novel-noah-pause',scene:'greenhouse',member:'noah',offset:160},
 {asset:'novel-bamby-rhythm',scene:'plaza',member:'bamby',offset:160},
 {asset:'novel-hamin-stargazing',scene:'observatory',member:'hamin'}
];
actorAnchors.push({asset:'novel-concert-wide',scene:'birthday',member:'concert',offset:0,group:'concert',ground:.69});
window.YitingActors?.configure(actorAnchors.map(actor=>{const encounter=route.findIndex(story=>story.asset===actor.asset);return {...actor,x:starAt(encounter)+(actor.offset??140)*stageLength/oldStageLength,...(actor.member==='eunho'?{followFrom:encounter+1,followUntil:route.findIndex(story=>story.chapter===(actor.scene==='asterum'?4:6))}:{})};}));
function drawContinuousWorld(scale,h){
 for(const region of worldRegions){
  if(region.end<camera||region.start>camera+vw)continue;
  const left=(region.start-camera)*scale,width=(region.end-region.start)*scale,img=sceneImages.get(region.source);
  ctx.save();ctx.beginPath();ctx.rect(left,0,width,h);ctx.clip();
  const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,'#121b38');sky.addColorStop(1,'#332444');ctx.fillStyle=sky;ctx.fillRect(left,0,width,h);
  if(img?.complete&&img.naturalWidth){
   // Scale both axes equally. Mirrored repetitions join matching edges without compressing the artwork.
   const tileWidth=h*img.naturalWidth/img.naturalHeight,worldTileWidth=tileWidth/scale;
   const first=Math.max(0,Math.floor((camera-region.start)/worldTileWidth)),last=Math.ceil((Math.min(region.end,camera+vw)-region.start)/worldTileWidth);
   for(let tile=first;tile<last;tile++){
    const px=(region.start+tile*worldTileWidth-camera)*scale;
    ctx.save();ctx.imageSmoothingEnabled=true;
    if(tile%2){ctx.translate(px+tileWidth,0);ctx.scale(-1,1);ctx.drawImage(img,0,0,tileWidth,h);}
    else ctx.drawImage(img,px,0,tileWidth,h);
    ctx.restore();
   }
  }
  if(region.start>0){const edge=Math.min(100,width*.12),fade=ctx.createLinearGradient(left,0,left+edge,0);fade.addColorStop(0,'rgba(19,23,48,.32)');fade.addColorStop(1,'rgba(19,23,48,0)');ctx.fillStyle=fade;ctx.fillRect(left,0,edge,h);}
  ctx.restore();
 }
}

function drawSceneDetails(t,w,h,scale){
 const scene=sceneForDisplay(),tone=colors[scene.color]||'#e7c9a4';
 const seed={city:1,asterum:2,garden:3,greenhouse:4,plaza:5,observatory:6,eunho:7,birthday:8,wish:9,farewell:10}[scene.id]||0,drift=reduced?0:t*.00022;
 ctx.save();
 const haze=ctx.createLinearGradient(0,0,0,h);
 haze.addColorStop(0,'rgba(12,18,43,0)');haze.addColorStop(.74,tone+'0b');haze.addColorStop(1,tone+'26');
 ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);
 if(!reduced){for(let i=0;i<20;i++){
 const span=vw+240,world=(((i*173+seed*67-camera*.12)%span)+span)%span-120,px=world*scale;
 const py=h*(.15+((i*7+seed)%13)/19)+Math.sin(drift+i*2)*4;
 if(px<0||px>w)continue;
 ctx.globalAlpha=.22+.22*Math.sin(drift*2+i)**2;
 ctx.fillStyle=i%4===0?'#fff8e8':tone;ctx.beginPath();ctx.arc(px,py,1.2+(i%3)*.8,0,Math.PI*2);ctx.fill();
 }ctx.globalAlpha=1;}
 // Ground lights guide the player toward the next story beat.
 for(let i=Math.floor(camera/110)-1;i<=Math.ceil((camera+vw)/110)+1;i++){
 const wx=i*110,px=(wx-camera)*scale;
 if(px<0||px>w)continue;
 ctx.globalAlpha=.12+.09*Math.sin(drift*4+i)**2;
 ctx.fillStyle=tone;ctx.beginPath();ctx.ellipse(px,h*.847,14*scale,3*scale,0,0,Math.PI*2);ctx.fill();
 }
 ctx.restore();
}

let lastUpdate=0,lastVisibleSegment=-1;function draw(t){const dt=Math.min((t-last)/1000||0,.04);last=t;const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);vw=Math.min(1600,900*w/h);const scale=w/vw;const maxCamera=Math.max(0,worldLength-vw),cameraTarget=Math.max(0,Math.min(maxCamera,x-vw*.4));camera=reduced?cameraTarget:Math.max(0,Math.min(maxCamera,camera+(cameraTarget-camera)*(1-Math.exp(-dt*8))));canvas.dataset.camera=camera.toFixed(3);canvas.dataset.viewWidth=String(vw);canvas.dataset.worldRight=String(worldRight);const visibleSegment=Math.max(0,Math.min(route.length-1,Math.floor((camera+vw*.5)/stageLength)));if(visibleSegment!==lastVisibleSegment){lastVisibleSegment=visibleSegment;preloadWorldSegments(visibleSegment);}if(ready){const dir=keys.has('arrowright')||keys.has('d')?1:keys.has('arrowleft')||keys.has('a')?-1:0;if(dir)target=Math.max(80,Math.min(movementLimit(),x+dir*160));target=Math.min(movementLimit(),target);const distance=target-x,desired=!modalOpen()&&Math.abs(distance)>3?Math.sign(distance)*Math.min(210,Math.abs(distance)*4):0;speed+=(desired-speed)*(1-Math.exp(-dt*12));x=Math.max(80,Math.min(movementLimit(),x+speed*dt));motionBlend+=(Math.min(1,Math.abs(speed)/90)-motionBlend)*(1-Math.exp(-dt*10));walkPhase=(walkPhase+Math.abs(speed)*dt/(h*.39/scale*.6))%1;if(Math.abs(speed)>8)facing=Math.sign(speed);canvas.dataset.motionFrame=String(Math.floor(walkPhase*60));canvas.dataset.motionBlend=motionBlend.toFixed(3);
if(t-lastPositionSave>1500&&Math.abs(x-lastSavedX)>1){lastPositionSave=t;save();}const playerScene=sceneForDisplay();if(canvas.dataset.scene!==playerScene.id){canvas.dataset.scene=playerScene.id;$('sceneLabel').textContent=playerScene.label;document.querySelector('.stage').setAttribute('aria-label',playerScene.label);}drawContinuousWorld(scale,h);drawSceneDetails(t,w,h,scale);window.YitingPassages?.draw(ctx,{t,w,h,camera,scale,reduced});window.YitingStageLights?.draw(ctx,{id:playerScene.id,t,w,h,reduced});const ground=h*.85,color=colors[theme()]||'#edcd8c';ctx.save();ctx.translate((waypoint-camera)*scale,ground-120*scale);ctx.shadowColor=color;ctx.shadowBlur=25;ctx.fillStyle=color;ctx.font=`${45*scale*(reduced?1:1+Math.sin(t*.003)*.1)}px serif`;ctx.textAlign='center';if(current())ctx.fillText('✦',0,0);for(let n=Math.max(0,Math.floor((camera-120)/stageLength));n<index&&n<route.length&&starAt(n)<camera+vw+120;n++){ctx.fillStyle='#b8c7e5';ctx.globalAlpha=.6;ctx.fillText('✧',(starAt(n)-waypoint)*scale,0);}ctx.restore();ctx.save();ctx.translate((x-camera)*scale,ground);ctx.scale(1,.2);const shadow=ctx.createRadialGradient(0,0,0,0,0,h*.065);shadow.addColorStop(0,'#080b2266');shadow.addColorStop(1,'#080b2200');ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,h*.065,0,Math.PI*2);ctx.fill();ctx.restore();window.YitingActors?.draw(ctx,{id:playerScene.id,w,h,camera,scale,t,reduced,playerX:x,playerFacing:facing,dt:modalOpen()?0:dt,index});window.YitingFootsteps.draw(ctx,{id:sceneForDisplay().id,phase:walkPhase,amount:motionBlend,x,camera,scale,height:h*.39,ground,facing,dt,reduced});canvas.dataset.footContacts=String(window.YitingFootsteps.contacts);const frameIndex=Math.abs(speed)>8?1+Math.floor(walkPhase*4)%4:0;const [sx,sy,sw,sh]=classicFrames[frameIndex],size=h*.39/705;ctx.save();ctx.translate((x-camera)*scale,ground);ctx.scale(facing,1);ctx.drawImage(classicSprite,sx,sy,sw,sh,-sw*size/2,-sh*size,sw*size,sh*size);ctx.restore();window.YitingAtmosphere?.draw(ctx,{id:playerScene.id,t,w,h,camera,reduced});if(!reduced){ctx.fillStyle=color+'99';for(let i=0;i<16;i++)ctx.fillRect(((i*109+t*.008+Math.floor(camera/1600)*1600)%1600+Math.floor(camera/1600)*1600-camera)*scale,h*(.12+(i%6)*.1),1.5,1.5);}if(t-lastUpdate>100){lastUpdate=t;const near=nearbyStory();$('interact').disabled=!ready||near<0;$('interact').textContent=interactionLabel(near);canvas.dataset.playerX=String(Math.round(x));canvas.dataset.facing=String(facing);}}
requestAnimationFrame(draw);}
refresh();changeBackground();requestAnimationFrame(draw);
})();



// Suppress iOS selection/callout only on play controls; story text stays selectable.
(()=>{for(const element of document.querySelectorAll('.controls,#world,#interact')){element.addEventListener('contextmenu',event=>event.preventDefault());element.addEventListener('selectstart',event=>event.preventDefault());}})();

