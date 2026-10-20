(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),dialog=$('story'),music=$('music');
// An explicit exit also works on touch devices without a hardware Escape key.
const storyToolbar=document.createElement('div');storyToolbar.className='story-toolbar';
$('storyContext').before(storyToolbar);storyToolbar.append($('storyContext'));
$('line').tabIndex=0;
const closeStory=document.createElement('button');closeStory.id='closeStory';closeStory.type='button';closeStory.innerHTML='<svg viewBox="0 0 16 16" width="13" height="13" aria-hidden="true" focusable="false"><path d="M6 3 2 7l4 4M2 7h7a4 4 0 0 1 4 4v2" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg><span>返回旅程</span>';closeStory.setAttribute('aria-label','暫停閱讀並返回旅程，保留目前對白');closeStory.onclick=()=>dialog.close();storyToolbar.append(closeStory);
const replacement={'novel-bamby-dance-pause':'novel-bamby-dance-pause-v2.png','novel-bamby-closeup':'E00F34EB-9BDE-4825-883E-9EA4E8C618A4.png','novel-welcome-teasing':'D8AF4512-1868-4624-95B9-9FEC559B6A0C.png'};
const chapters=window.YITING_NOVEL_CHAPTERS,route=[];
window.NOVEL_PANELS.forEach((panels,chapter)=>panels.forEach(([asset,narration,lines,star],panel)=>{route.push({asset,narration,lines,star,chapter,panel});(window.YITING_EXTRA_SHOTS||[]).filter(s=>s.chapter===chapter&&s.after===asset).forEach(s=>route.push({asset:s.asset,narration:s.narration,lines:[],chapter,sourcePanel:panel,panel:s.id}));}));
const readingSaveNotice=document.createElement('p');readingSaveNotice.id='storySaveStatus';readingSaveNotice.hidden=true;readingSaveNotice.setAttribute('role','status');document.querySelector('.story-navigation').before(readingSaveNotice);
document.querySelector('.stage').append($('saveState'));$('saveState').setAttribute('role','status');
const key='yiting-explore-story-v1';let saved={};try{saved=JSON.parse(localStorage.getItem(key)||'{}')||{};}catch{}
const valid=n=>Number.isInteger(n)&&n>=0&&n<=route.length;
let index=valid(saved.index)?saved.index:0,unlocked=valid(saved.unlocked)?saved.unlocked:0;
// Older saves only allowed a continuous read-through. New saves keep each read
// asset separately, so choosing a later chapter does not complete earlier ones.
const routeAssets=new Set(route.map(shot=>shot.asset));
const completed=new Set(Array.isArray(saved.completed)?saved.completed.filter(asset=>routeAssets.has(asset)):route.slice(0,Math.max(index,unlocked)).map(shot=>shot.asset));
const contiguousRead=()=>{let count=0;while(count<route.length&&completed.has(route[count].asset))count++;return count;};
unlocked=contiguousRead();
window.yitingExploreProgress={hasRead:asset=>completed.has(asset),get count(){return completed.size;}};
let resumeReading=saved.reading&&typeof saved.reading.asset==='string'&&Number.isInteger(saved.reading.line)&&saved.reading.line>=0?{asset:saved.reading.asset,line:saved.reading.line}:null;
let x=180,target=180,waypoint=720,speed=0,facing=1,camera=0,vw=1600,last=0,walkPhase=0,motionBlend=0,muted=false,ready=false,line=0,backgroundToken=0;
const classicSprite=new Image();classicSprite.src='assets/explore-yiting-walk-v1.png';const classicFrames=[[28,18,250,705],[326,18,370,705],[677,18,310,705],[1000,18,410,705],[1400,18,345,705],[1790,18,250,705]];
let reviewIndex=null,autoDestination=null;
// Version 2 keeps every story node, but makes walking between stars less repetitive.
// Old saves use 960-unit intervals; migrate their position once without changing story progress.
const mapVersion=2,oldStageLength=960,oldStarPosition=720,stageLength=400,starPosition=280;
const starAt=n=>starPosition+n*stageLength;
const stationarySegments=[{first:route.findIndex(s=>s.asset==='novel-portal'),last:route.findIndex(s=>s.asset==='novel-eunho-portal-reassuring-eyes')},{first:route.findIndex(s=>s.asset==='novel-eunho-conversation'),last:route.findIndex(s=>s.asset==='novel-five-stars')},{first:route.findIndex(s=>s.asset==='novel-group-farewell'),last:route.findIndex(s=>s.asset==='novel-yiting-memento-smile')},{first:route.findIndex(s=>s.asset==='novel-yejun-guitar-fullhead-v2'),last:route.findIndex(s=>s.asset==='novel-blue-star-detail')},{first:route.findIndex(s=>s.asset==='novel-noah-pause'),last:route.findIndex(s=>s.asset==='novel-noah-closeup')},{first:route.findIndex(s=>s.asset==='novel-bamby-rhythm'),last:route.findIndex(s=>s.asset==='novel-bamby-closeup')},{first:route.findIndex(s=>s.asset==='novel-hamin-stargazing'),last:route.findIndex(s=>s.asset==='novel-hamin-closeup')},{first:route.findIndex(s=>s.asset==='novel-asterum-arrival-overlook'),last:route.findIndex(s=>s.asset==='novel-welcome-teasing')},{first:route.findIndex(s=>s.chapter===1),last:route.findLastIndex(s=>s.chapter===1)},{first:route.findIndex(s=>s.chapter===6),last:route.findLastIndex(s=>s.chapter===6)},{first:route.findIndex(s=>s.chapter===7),last:route.findLastIndex(s=>s.chapter===7)},{first:route.findIndex(s=>s.asset==='novel-terrace-before-stage-wide'),last:route.findIndex(s=>s.asset==='novel-yiting-terrace-reaction')},{first:route.findIndex(s=>s.asset==='novel-city-return-wide'),last:route.findIndex(s=>s.asset==='novel-final-message')}].filter(s=>s.first>=0&&s.last>=s.first);
const isFixedStory=n=>stationarySegments.some(s=>n>=s.first&&n<=s.last);
const stationaryStart=n=>stationarySegments.find(s=>n>=s.first&&n<=s.last)?.first??n;
const stationaryEnd=n=>stationarySegments.find(s=>n>=s.first&&n<=s.last)?.last??n;
const storyWaypoint=n=>starAt(stationaryStart(n));
const migratePosition=oldX=>oldX<=180?oldX:oldX<=oldStarPosition?180+(oldX-180)*(starPosition-180)/(oldStarPosition-180):starPosition+(oldX-oldStarPosition)*stageLength/oldStageLength;
const worldLength=route.length*stageLength,worldRight=worldLength-80;
const movementLimit=()=>Math.min(worldRight,waypoint);
const validReading=value=>value&&typeof value.asset==='string'&&Number.isInteger(value.line)&&value.line>=0&&route.some(s=>s.asset===value.asset&&value.line<=s.lines.length)?{asset:value.asset,line:value.line}:null;
let revisitOrigin=saved.mapVersion===2&&saved.revisit&&valid(saved.revisit.index)&&(Array.isArray(saved.completed)||saved.revisit.index<=unlocked)&&Number.isFinite(saved.revisit.x)?{index:saved.revisit.index,x:Math.max(80,Math.min(worldRight,starAt(saved.revisit.index),saved.revisit.x)),reading:validReading(saved.revisit.reading)}:null;

waypoint=storyWaypoint(index);
const savedPosition=Number.isFinite(saved.x)?(saved.mapVersion===mapVersion?saved.x:migratePosition(saved.x)):Math.max(180,index===0?180:starAt(index-1));
x=target=Math.max(80,Math.min(movementLimit(),savedPosition));let lastSavedX=x,lastPositionSave=0;camera=Math.max(0,x-250);const sceneImages=new Map();const keys=new Set(),motionPreference=matchMedia('(prefers-reduced-motion: reduce)');let reduced=motionPreference.matches;motionPreference.addEventListener('change',event=>{reduced=event.matches;});
const colors={blue:'#77baff',purple:'#c5a2ef',pink:'#f2a3c0',green:'#8dd2b0',red:'#e57291',gold:'#e7c789'};
const current=()=>route[index];const sceneForDisplay=()=>window.yitingExploreScene(route[Math.max(0,Math.min(route.length-1,Math.floor(x/stageLength)))]);const art=asset=>'assets/'+(replacement[asset]||asset+'.webp');
let reviewOriginReading=null;
function save(){try{localStorage.setItem(key,JSON.stringify({mapVersion,index,unlocked,completed:[...completed],x,reading:reviewIndex!==null?reviewOriginReading:resumeReading,revisit:revisitOrigin,updated:Date.now()}));lastSavedX=x;readingSaveNotice.hidden=true;readingSaveNotice.textContent='';delete $('saveState').dataset.failed;$('saveState').textContent='位置與閱讀進度已保存在這個瀏覽器';}catch{if(!$('saveState').dataset.failed){$('saveState').textContent='瀏覽器目前無法保存進度；本次仍可繼續，下次可能從較早的位置接續。';readingSaveNotice.textContent='這段暫時無法保存，下次可能需要重新閱讀；本次仍可繼續。';}$('saveState').dataset.failed='true';readingSaveNotice.hidden=false;}}
function stop(){autoDestination=null;keys.clear();target=x;speed=0;if(ready&&Math.abs(x-lastSavedX)>1)save();}const modalOpen=()=>!!document.querySelector('dialog[open]');window.addEventListener('yiting-explore-modal',stop);
const playlist=window.YITING_TRACKS||[],stored=window.yitingMusicRead?.()||{index:0,paused:false};
let musicIndex=Number.isInteger(stored.index)&&stored.index>=0&&stored.index<playlist.length?stored.index:0;
muted=stored.paused===true;
music.loop=false;
if(playlist.length)music.src=playlist[musicIndex].src;
function audio(){if(!muted)music.play().catch(()=>{});}
function notifyMusic(){window.dispatchEvent(new CustomEvent('yiting-explore-music-change',{detail:{index:musicIndex,paused:muted}}));}
function chooseSong(next){
 if(!Number.isInteger(next)||next<0||next>=playlist.length)return false;
 if(next!==musicIndex){musicIndex=next;music.src=playlist[musicIndex].src;music.load();}
 window.yitingMusicSave?.({index:musicIndex,paused:muted});audio();notifyMusic();return true;
}
function nextSong(){if(playlist.length&&!muted)chooseSong((musicIndex+1)%playlist.length);}
window.yitingExploreMusic={getState:()=>({index:musicIndex,paused:muted}),select:chooseSong};
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
function interactionLabel(near){return near<0?(current()?(autoDestination!==null?'正前往下一道星光…':'下一道星光在右方 →'):(completed.size===route.length?'旅程完成 · 回頭重溫':'已到故事終點 · 自由選章')):rememberedLine(route[near])>0?'✦ 接續上次閱讀':near<index?(completed.has(route[near].asset)?'✦ 重溫這段故事':'✦ 閱讀這段故事'):(isFixedStory(index)?'✦ 接續這一幕故事':'✦ 發現這段故事');}
function theme(){return current()?.star||sceneForDisplay().color;}
function refresh(){const s=current(),done=!s;document.querySelector('.controls p').innerHTML=isFixedStory(index)?'同一場景，接續故事<br><small>左右移動仍可回頭探索</small>':'讀完自動前往下一格<br><small>電腦：← → / A D 移動，E 互動</small>';$("endLink").hidden=!done;document.body.dataset.chapter=String(s?.chapter??9);$('chapterName').textContent=done?'生日快樂，YiTing':chapters[s.chapter].title;$('objective').textContent=done?(completed.size===route.length?'妳已走完整段星光旅程。謝謝妳來到這個世界。':'妳已來到故事的終點。隨時選章，繼續看看其他故事。'):window.yitingExploreScene(s).hint;$('chapterKicker').textContent=(done||s.chapter===9?'10:21 PM · ':'10:20 PM · ')+(done?'THE STARLIGHT JOURNEY':chapters[s.chapter].kicker);$('progress').textContent=(Math.min(index+1,route.length))+' / '+route.length+' · '+(done?(completed.size===route.length?'旅程完成':'終章讀畢'):chapters[s.chapter].label);$('fiveStars').replaceChildren();for(const [color,name] of Object.entries({blue:'希望',purple:'溫柔',pink:'快樂',green:'勇氣',red:'陪伴'})){const badge=document.createElement('span'),owned=route.some(s=>s.star===color&&completed.has(s.asset));badge.dataset.starColor=color;badge.textContent=(owned?'✦ ':'· ')+name;badge.style.color=owned?colors[color]:'#73788a';badge.setAttribute('aria-label',name+(owned?'已收集':'尚未收集'));$('fiveStars').append(badge);}const ownedNames=[...$('fiveStars').children].filter(b=>b.getAttribute('aria-label').endsWith('已收集')).map(b=>b.getAttribute('aria-label').replace('已收集',''));$('fiveStars').setAttribute('role',ownedNames.length?'button':'group');$('fiveStars').tabIndex=ownedNames.length?0:-1;$('fiveStars').setAttribute('aria-label',ownedNames.length?'五道星光收藏，已收集'+ownedNames.join('、')+'。開啟相遇紀錄':'五道星光收藏，前往故事收集星光');if(ownedNames.length)$('fiveStars').setAttribute('aria-haspopup','dialog');else $('fiveStars').removeAttribute('aria-haspopup');$('fiveStars').title=ownedNames.length?'輕觸重溫已收下的星光':'';$('journeyProgress').max=route.length;$('journeyProgress').value=completed.size;$('journeyProgress').setAttribute('aria-label','故事已讀進度');$('sceneLabel').textContent=sceneForDisplay().label;canvas.dataset.scene=sceneForDisplay().id;document.querySelector('.stage').setAttribute('aria-label',sceneForDisplay().label);$('storyLink').href='novel-comic.html#chapter-'+(s?.chapter??9)+'-panel-'+(s?.panel??0);$('storyLink').hidden=done;
const near=nearbyStory();$('interact').disabled=!ready||near<0;$('interact').textContent=interactionLabel(near);canvas.dataset.index=String(index);canvas.dataset.completedCount=String(completed.size);canvas.dataset.mapVersion=String(mapVersion);canvas.dataset.stageLength=String(stageLength);canvas.dataset.keepsake=String(completed.has('novel-star-closeup'));canvas.dataset.playerX=String(Math.round(x));canvas.dataset.waypoint=String(waypoint);canvas.dataset.facing=String(facing);
returnJourney.hidden=!revisitOrigin;if(revisitOrigin)returnJourney.textContent='↩ 回到剛才的位置 · '+Math.min(revisitOrigin.index+1,route.length)+' / '+route.length; $('chapterMenu').replaceChildren();if(revisitOrigin){const option=document.createElement('option');option.value='resume';option.textContent='↩ 回到剛才的位置 · '+Math.min(revisitOrigin.index+1,route.length)+' / '+route.length;$('chapterMenu').append(option);}chapters.forEach((chapter,c)=>{const option=document.createElement('option'),first=route.findIndex(s=>s.chapter===c);option.value=first;option.textContent=chapter.title;option.selected=c===(s?.chapter??9);$('chapterMenu').append(option);});if(ready)warmStoryArt();}
const sceneCache=new Map(),sceneWanted=new Set();
function rememberScene(source,image){if(sceneWanted.has(source)&&sceneCache.get(source)?.image===image)sceneImages.set(source,image);}
function loadScene(source){
 sceneWanted.add(source);
 if(!sceneCache.has(source)){const image=new Image(),record={image,promise:null};sceneCache.set(source,record);image.src=source;record.promise=image.decode().then(()=>image).catch(error=>{if(sceneCache.get(source)===record)sceneCache.delete(source);throw error;});}
 return sceneCache.get(source).promise;
}
function retainScenes(wanted){
 sceneWanted.clear();for(const source of wanted)sceneWanted.add(source);
 for(const [source,record]of sceneCache)if(!wanted.has(source)){sceneCache.delete(source);sceneImages.delete(source);record.image.removeAttribute('src');}
}
// Pin visible scenery as well as nearby story nodes, so looking back stays seamless.
function preloadWorldSegments(center=index){
 const wanted=new Set([sceneForDisplay().source]);
 for(const region of worldRegions)if(region.end>=camera-stageLength&&region.start<=camera+vw+stageLength)wanted.add(region.source);
 for(const anchor of [center,index])for(let n=Math.max(0,anchor-1);n<=Math.min(route.length-1,anchor+3);n++)wanted.add(window.yitingExploreScene(route[n]).source);
 retainScenes(wanted);
 for(const source of wanted)if(!sceneImages.has(source))loadScene(source).then(img=>rememberScene(source,img)).catch(()=>{});
}
window.YitingSceneCache={get count(){return sceneCache.size;},get decoded(){return sceneImages.size;},get decodedSources(){return [...sceneImages.keys()];},get sources(){return [...sceneCache.keys()];},get wanted(){return [...sceneWanted];}};
async function changeBackground(){const token=++backgroundToken,scene=sceneForDisplay();ready=false;const pendingAuto=autoDestination;stop();autoDestination=pendingAuto;$('loading').hidden=false;$('loading').textContent='正在走進下一段風景…';try{const [image]=await Promise.all([loadScene(scene.source),classicSprite.decode()]);if(token!==backgroundToken)return;rememberScene(scene.source,image);preloadWorldSegments();ready=true;$('loading').hidden=true;refresh();preloadWorldSegments();const next=route[index+1];if(next)loadScene(window.yitingExploreScene(next).source).then(img=>rememberScene(window.yitingExploreScene(next).source,img)).catch(()=>{});}catch{if(token!==backgroundToken)return;/* Missing scene art should not prevent finishing the novel. */try{await classicSprite.decode();}catch{$('loading').textContent='角色圖片暫時無法載入，請重新整理遊戲。';return;}ready=true;$('loading').hidden=true;refresh();preloadWorldSegments();}}
function nearbyStory(){if(Math.abs(x-waypoint)<115&&current())return index;for(let n=Math.min(index-1,route.length-1);n>=0;n--){const first=stationaryStart(n);if(Math.abs(x-starAt(first))<115)return first;n=first;}return -1;}
let dialogueArrival=null;
function revealDialogue(){dialogueArrival?.cancel();dialogueArrival=null;if(!reduced&&typeof $('line').animate==='function')dialogueArrival=$('line').animate([{opacity:.45},{opacity:1}],{duration:180,easing:'ease-out'});}
motionPreference.addEventListener('change',()=>{dialogueArrival?.cancel();dialogueArrival=null;});
function showLine(){const s=route[reviewIndex??index],rows=[['故事旁白',s.narration],...s.lines];$('previousLine').disabled=line===0;$('linePosition').textContent=(line+1)+' / '+rows.length;$('speaker').textContent=rows[line][0];dialog.dataset.voice=rows[line][0];$('speaker').dataset.label=({'藝俊':'YEJUN','諾亞':'NOAH','斑比':'BAMBY','河玟':'HAMIN','銀虎':'EUNHO','YiTing':'YITING','PLAVE':'PLAVE'})[rows[line][0]]||'STORY';$('line').textContent=rows[line][1];$('line').scrollTop=0;revealDialogue();$('continue').textContent=line<rows.length-1?'繼續 →':reviewIndex!==null?(isFixedStory(reviewIndex)&&reviewIndex+1<index&&stationaryStart(reviewIndex+1)===stationaryStart(reviewIndex)?'下一格 · 繼續重溫 →':'結束重溫 →'):index===route.length-1?'把星光帶回日常':(isFixedStory(reviewIndex??index)&&stationaryStart((reviewIndex??index)+1)===stationaryStart(reviewIndex??index)?'下一格 · 留在這裡 →':'繼續旅程 →');resumeReading={asset:s.asset,line};save();}
function faceEncounter(n){
 // Turn only at a stationary member encounter; walking and group scenes retain manual facing.
 const start=stationaryStart(n);
 for(const actor of actorAnchors){
  if(!['garden','greenhouse','plaza','observatory','eunho'].includes(actor.scene))continue;
  const at=route.findIndex(shot=>shot.asset===actor.asset);
  if(at<0||stationaryStart(at)!==start)continue;
  const lookX=storyWaypoint(at)+(actor.offset??140)*stageLength/oldStageLength;
  if(Math.abs(lookX-x)>2)facing=Math.sign(lookX-x);
  return;
 }
}
function openStory(){const found=nearbyStory();if(found<0||!ready)return;audio();stop();reviewIndex=found<index?found:null;reviewOriginReading=reviewIndex!==null&&resumeReading?{...resumeReading}:null;const s=route[found];faceEncounter(found);const chapterShots=route.filter(row=>row.chapter===s.chapter);$('storyContext').textContent=chapters[s.chapter].label+' · '+(chapterShots.indexOf(s)+1)+' / '+chapterShots.length+' 格';line=rememberedLine(s);$('storyArt').alt=s.narration;$('artStatus').textContent='';warmStoryArt(found);loadStoryArt(s);showLine();dialog.showModal();dialog.scrollTop=0;}
$('artStatus').onclick=()=>{const shot=route[reviewIndex??index];if(shot)loadStoryArt(shot,{retry:true});};
$('previousLine').onclick=()=>{if(!dialog.open||line<=0)return;audio();line--;showLine();};
$('continue').onclick=()=>{if(!dialog.open)return;audio();const s=route[reviewIndex??index];if(!s)return;if(line<s.lines.length){line++;showLine();return;}resumeReading=null;const earnedStar=s.star&&!completed.has(s.asset)?s.star:null;completed.add(s.asset);unlocked=contiguousRead();if(earnedStar)window.dispatchEvent(new CustomEvent('yiting-explore-star',{detail:{color:earnedStar}}));if(reviewIndex!==null){refresh();const next=reviewIndex+1;if(isFixedStory(reviewIndex)&&next<index&&stationaryStart(next)===stationaryStart(reviewIndex)){reviewIndex=next;const shot=route[next];line=0;const shots=route.filter(row=>row.chapter===shot.chapter);$('storyContext').textContent=chapters[shot.chapter].label+' · '+(shots.indexOf(shot)+1)+' / '+shots.length+' 格';$('storyArt').alt=shot.narration;warmStoryArt(next);loadStoryArt(shot);showLine();dialog.scrollTop=0;return;}resumeReading=reviewOriginReading;reviewOriginReading=null;reviewIndex=null;dialog.close();save();refresh();return;}index++;if(revisitOrigin&&index===revisitOrigin.index)revisitOrigin=null;if(isFixedStory(index-1)&&isFixedStory(index)&&stationaryStart(index)===stationaryStart(index-1)){waypoint=storyWaypoint(index);autoDestination=null;target=x;save();refresh();const shot=current();line=0;const chapterShots=route.filter(row=>row.chapter===shot.chapter);$('storyContext').textContent=chapters[shot.chapter].label+' · '+(chapterShots.indexOf(shot)+1)+' / '+chapterShots.length+' 格';$('storyArt').alt=shot.narration;$('artStatus').textContent='';loadStoryArt(shot);showLine();dialog.scrollTop=0;return;}dialog.close();stop();waypoint=storyWaypoint(index);target=x;if(isFixedStory(index)&&stationaryStart(index)!==index){autoDestination=null;target=x;}else if(isFixedStory(index-1)){x=target=waypoint-180;camera=Math.max(0,x-vw*.4);autoDestination=current()?index:null;}else autoDestination=current()?index:null;save();refresh();preloadWorldSegments();const nextSource=sceneForDisplay().source;if(!sceneImages.has(nextSource))changeBackground();else {ready=true;const ahead=route[index+1];if(ahead){const src=window.yitingExploreScene(ahead).source;loadScene(src).then(img=>rememberScene(src,img)).catch(()=>{});}}if(!current()){$('endLink').hidden=false;refresh();}};
$('interact').onclick=()=>{if(!$('interact').disabled)openStory();};dialog.addEventListener('close',()=>{if(!dialog.open){storyArtToken++;if(reviewIndex!==null){resumeReading=reviewOriginReading;reviewOriginReading=null;reviewIndex=null;save();}}canvas.focus({preventScroll:true});});
canvas.addEventListener('pointerdown',e=>{if(!ready||modalOpen())return;autoDestination=null;const r=canvas.getBoundingClientRect();target=Math.max(80,Math.min(movementLimit(),camera+(e.clientX-r.left)/r.width*vw));audio();canvas.focus({preventScroll:true});});
window.addEventListener('keydown',e=>{if(modalOpen()||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('input,textarea,select,[contenteditable="true"],a')||e.target.closest('button:not(#left):not(#right)'))return;const k=e.key.toLowerCase();if(['arrowleft','arrowright','a','d'].includes(k)){e.preventDefault();autoDestination=null;keys.add(k);audio();}if(k==='e')$('interact').click();});window.addEventListener('keyup',e=>{keys.delete(e.key.toLowerCase());if(!keys.size)target=x;});window.addEventListener('blur',stop);window.addEventListener('pagehide',stop);window.addEventListener('resize',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
for(const [id,key]of[['left','arrowleft'],['right','arrowright']]){const b=$(id);b.addEventListener('pointerdown',e=>{if(modalOpen()||!ready)return;e.preventDefault();autoDestination=null;b.setPointerCapture(e.pointerId);keys.add(key);audio();});for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,()=>{keys.delete(key);target=x;});}
$('sound').onclick=()=>{muted=!muted;window.yitingMusicSave?.({index:musicIndex,paused:muted});if(muted)music.pause();else audio();$('sound').textContent=muted?'音樂關閉':'音樂開啟';$('sound').setAttribute('aria-pressed',String(!muted));notifyMusic();};
const returnJourney=document.createElement('button');returnJourney.id='returnJourney';returnJourney.type='button';returnJourney.hidden=true;document.querySelector('.chapter-picker').after(returnJourney);returnJourney.onclick=()=>{$('chapterMenu').value='resume';$('chapterMenu').onchange();};
$('chapterMenu').onchange=()=>{if($('chapterMenu').value==='resume'){if(!revisitOrigin)return;stop();const origin=revisitOrigin;revisitOrigin=null;index=origin.index;resumeReading=origin.reading;x=target=origin.x;}else{const next=Number($('chapterMenu').value);if(!valid(next)||next===route.length)return;stop();if(!revisitOrigin)revisitOrigin={index,x,reading:resumeReading?{...resumeReading}:null};index=next;resumeReading=null;x=target=Math.max(180,storyWaypoint(index)-100);}camera=Math.max(0,x-250);waypoint=storyWaypoint(index);$('endLink').hidden=true;save();refresh();changeBackground();};
$('restart').onclick=()=>{$('restartDialog').showModal();};$('cancelRestart').onclick=()=>$('restartDialog').close();$('confirmRestart').onclick=()=>{$('restartDialog').close();stop();revisitOrigin=null;resumeReading=null;index=0;unlocked=0;completed.clear();x=target=180;camera=0;waypoint=starAt(0);$('endLink').hidden=true;save();refresh();changeBackground();};

// Lightweight scene dressing: each discovered star advances the environment
// without requiring a duplicate background image or changing the character artwork.
// Consecutive story nodes share one environment strip; narrative coordinates stay unchanged.
const worldRegions=[];
route.forEach((story,n)=>{const source=window.yitingExploreScene(story).source,last=worldRegions.at(-1);if(last?.source===source)last.end=(n+1)*stageLength;else worldRegions.push({source,start:n*stageLength,end:(n+1)*stageLength});});
window.YitingPassages?.configure([3,9].map(chapter=>({x:route.findIndex(story=>story.chapter===chapter)*stageLength,returning:chapter===9})));
window.YitingWelcomeParty?.configure({anchor:starAt(route.findIndex(s=>s.asset==='novel-asterum-arrival-overlook')),start:route.findIndex(s=>s.asset==='novel-asterum-arrival-overlook')*stageLength,end:route.findIndex(s=>s.chapter===4)*stageLength});
const actorAnchors=[
 {asset:'novel-arrival-medium',scene:'asterum',member:'eunho',offset:340},
 {asset:'novel-eunho-conversation',scene:'eunho',member:'eunho',offset:340},
 {asset:'novel-farewell-medium',scene:'farewell',member:'eunho'},
 {asset:'novel-yejun-listening',scene:'garden',member:'yejun',offset:340},
 {asset:'novel-noah-pause',scene:'greenhouse',member:'noah',offset:340},
 {asset:'novel-bamby-rhythm',scene:'plaza',member:'bamby',offset:340},
 {asset:'novel-hamin-stargazing',scene:'observatory',member:'hamin',offset:340}
];
actorAnchors.push({asset:'novel-concert-wide',scene:'birthday',member:'concert',offset:0,group:'concert',ground:.69});
window.YitingActors?.configure(actorAnchors.map(actor=>{const encounter=route.findIndex(story=>story.asset===actor.asset);return {...actor,x:storyWaypoint(encounter)+(actor.offset??140)*stageLength/oldStageLength,...(actor.member==='eunho'?{followFrom:stationaryEnd(encounter)+1,followUntil:route.findIndex(story=>story.chapter===(actor.scene==='asterum'?4:actor.scene==='farewell'?9:6))}:actor.member!=='concert'?{followFrom:stationaryEnd(encounter)+1,followUntil:route.findIndex(story=>story.asset===({yejun:'novel-noah-pause',noah:'novel-bamby-rhythm',bamby:'novel-hamin-stargazing',hamin:'novel-eunho-conversation'})[actor.member])+1,followScenes:[({yejun:'greenhouse',noah:'plaza',bamby:'observatory',hamin:'eunho'})[actor.member]]}:{})};}));
const gardenBloomAnchor=storyWaypoint(route.findIndex(s=>s.asset==='novel-yejun-listening'));
const moonlightAnchor=storyWaypoint(route.findIndex(s=>s.asset==='novel-noah-pause'));
const courageSkyAnchor=storyWaypoint(route.findIndex(s=>s.asset==='novel-hamin-stargazing'));
const joyTrailAnchor=storyWaypoint(route.findIndex(s=>window.yitingExploreScene(s).id==='plaza'));
function drawContinuousWorld(scale,h,t){
 const fixedScene=sceneForDisplay();if(['birthday','wish'].includes(fixedScene.id)){const img=sceneImages.get(fixedScene.source);if(img?.complete&&img.naturalWidth){const size=Math.max(canvas.clientWidth/img.naturalWidth,h/img.naturalHeight),width=img.naturalWidth*size,height=img.naturalHeight*size;ctx.drawImage(img,(canvas.clientWidth-width)/2,(h-height)/2,width,height);if(fixedScene.id==='wish')window.YitingWishLights?.draw(ctx,{x:(canvas.clientWidth-width)/2,y:(h-height)/2,width,height,t,reduced});if(fixedScene.id==='wish'&&canvas.dataset.celebrationReady!=='true')canvas.dataset.celebrationReady='true';}else if(fixedScene.id==='wish'&&canvas.dataset.celebrationReady!=='false')canvas.dataset.celebrationReady='false';return;}
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

let lastUpdate=0,lastVisibleSegment=-1;function draw(t){const dt=Math.min((t-last)/1000||0,.04);last=t;const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);vw=Math.min(1600,900*w/h);const scale=w/vw;const maxCamera=Math.max(0,worldLength-vw),cameraTarget=Math.max(0,Math.min(maxCamera,x-vw*((sceneForDisplay().id==='wish'||window.YitingWelcomeParty?.active(sceneForDisplay().id,x))?.18:sceneForDisplay().id==='farewell'&&window.YitingGroupCompanions?.unifiedReady?(facing>0?.58:.42):.4)));camera=reduced?cameraTarget:Math.max(0,Math.min(maxCamera,camera+(cameraTarget-camera)*(1-Math.exp(-dt*8))));canvas.dataset.camera=camera.toFixed(3);canvas.dataset.viewWidth=String(vw);canvas.dataset.worldRight=String(worldRight);const visibleSegment=Math.max(0,Math.min(route.length-1,Math.floor((camera+vw*.5)/stageLength)));if(visibleSegment!==lastVisibleSegment||canvas.dataset.sceneryViewport!==w+'x'+h){canvas.dataset.sceneryViewport=w+'x'+h;lastVisibleSegment=visibleSegment;preloadWorldSegments(visibleSegment);}if(ready){if(autoDestination!==null&&!modalOpen()){if(autoDestination===index&&current()){target=movementLimit();if(Math.abs(x-target)<4)autoDestination=null;}else autoDestination=null;}canvas.dataset.autoWalking=String(autoDestination!==null);const dir=keys.has('arrowright')||keys.has('d')?1:keys.has('arrowleft')||keys.has('a')?-1:0;if(dir)target=Math.max(80,Math.min(movementLimit(),x+dir*160));target=Math.min(movementLimit(),target);const distance=target-x,desired=!modalOpen()&&Math.abs(distance)>3?Math.sign(distance)*Math.min(210,Math.abs(distance)*4):0;speed+=(desired-speed)*(1-Math.exp(-dt*12));const nextX=x+speed*dt,reached=distance===0||(target-nextX)*distance<=0;x=Math.max(80,Math.min(movementLimit(),reached?target:nextX));if(reached)speed=0;motionBlend+=(Math.min(1,Math.abs(speed)/90)-motionBlend)*(1-Math.exp(-dt*10));walkPhase=(walkPhase+Math.abs(speed)*dt/(h*.39/scale*.6))%1;if(Math.abs(speed)>8)facing=Math.sign(speed);canvas.dataset.motionFrame=String(Math.floor(walkPhase*60));canvas.dataset.motionBlend=motionBlend.toFixed(3);
if(t-lastPositionSave>1500&&Math.abs(x-lastSavedX)>1){lastPositionSave=t;save();}const playerScene=sceneForDisplay();if(canvas.dataset.scene!==playerScene.id||$('sceneLabel').textContent!==playerScene.label){canvas.dataset.scene=playerScene.id;$('sceneLabel').textContent=playerScene.label;document.querySelector('.stage').setAttribute('aria-label',playerScene.label);}drawContinuousWorld(scale,h,t);window.YitingCityWeather?.draw(ctx,{id:playerScene.id,t,w,h,reduced});if(!['birthday','wish'].includes(playerScene.id))window.YitingSeams?.draw(ctx,{regions:worldRegions,images:sceneImages,camera,scale,h,w});drawSceneDetails(t,w,h,scale);window.YitingJoyTrail?.draw(ctx,{id:playerScene.id,t,h,w,camera,scale,anchor:joyTrailAnchor,reduced});window.YitingCourageSky?.draw(ctx,{id:playerScene.id,t,h,w,camera,scale,anchor:courageSkyAnchor,reduced});window.YitingMoonlight?.draw(ctx,{id:playerScene.id,t,h,w,camera,scale,anchor:moonlightAnchor,reduced});window.YitingGardenBloom?.draw(ctx,{id:playerScene.id,t,h,w,camera,scale,anchor:gardenBloomAnchor,reduced});window.YitingPassages?.draw(ctx,{t,w,h,camera,scale,reduced,playerX:x});window.YitingStageLights?.draw(ctx,{id:playerScene.id,t,w,h,reduced});const ground=h*.85,color=colors[theme()]||'#edcd8c';ctx.save();ctx.translate((waypoint-camera)*scale,ground-120*scale);ctx.shadowColor=color;ctx.shadowBlur=25;ctx.fillStyle=color;ctx.font=`${45*scale*(reduced?1:1+Math.sin(t*.003)*.1)}px serif`;ctx.textAlign='center';if(current())ctx.fillText('✦',0,0);for(let n=Math.max(0,Math.floor((camera-120)/stageLength));n<index&&n<route.length&&starAt(n)<camera+vw+120;n++){if(stationaryStart(n)!==n)continue;ctx.fillStyle='#b8c7e5';ctx.globalAlpha=.6;ctx.fillText('✧',(starAt(n)-waypoint)*scale,0);}ctx.restore();ctx.save();ctx.translate((x-camera)*scale,ground);ctx.scale(1,.2);const shadow=ctx.createRadialGradient(0,0,0,0,0,h*.065);shadow.addColorStop(0,'#080b2266');shadow.addColorStop(1,'#080b2200');ctx.fillStyle=shadow;ctx.beginPath();ctx.arc(0,0,h*.065,0,Math.PI*2);ctx.fill();ctx.restore();window.YitingStarMoment?.draw(ctx,{t,x,camera,scale,ground,height:h*.39,facing});window.YitingActors?.draw(ctx,{id:playerScene.id,w,h,camera,scale,t,reduced,playerX:x,playerFacing:facing,dt:modalOpen()?0:dt,index});window.YitingFootsteps.draw(ctx,{id:sceneForDisplay().id,phase:walkPhase,amount:motionBlend,x,camera,scale,height:h*.39,ground,facing,dt,reduced});canvas.dataset.footContacts=String(window.YitingFootsteps.contacts);const frameIndex=Math.abs(speed)>8?1+Math.floor(walkPhase*4)%4:0;const [sx,sy,sw,sh]=classicFrames[frameIndex],size=h*.39/705;ctx.save();ctx.translate((x-camera)*scale,ground);ctx.scale(facing,1);window.YitingStride?.apply(ctx,{phase:walkPhase,amount:frameIndex>0&&!modalOpen()?motionBlend:0,height:h*.39,reduced});if(!window.YitingGroupCompanions?.includesPlayer)ctx.drawImage(classicSprite,sx,sy,sw,sh,-sw*size/2,-sh*size,sw*size,sh*size);ctx.restore();window.YitingAtmosphere?.draw(ctx,{id:playerScene.id,t,w,h,camera,reduced});window.YitingMotes?.draw(ctx,{id:playerScene.id,returning:playerScene.label==='TERRA / THE LIGHT STAYS WITH YOU',t,w,h,camera,reduced});if(t-lastUpdate>100){lastUpdate=t;const near=nearbyStory();$('interact').disabled=!ready||near<0;$('interact').textContent=interactionLabel(near);canvas.dataset.playerX=String(Math.round(x));canvas.dataset.facing=String(facing);}}
requestAnimationFrame(draw);}
refresh();changeBackground();requestAnimationFrame(draw);
})();



// Suppress iOS selection/callout only on play controls; story text stays selectable.
(()=>{for(const element of document.querySelectorAll('.controls,#world,#interact')){element.addEventListener('contextmenu',event=>event.preventDefault());element.addEventListener('selectstart',event=>event.preventDefault());}})();

