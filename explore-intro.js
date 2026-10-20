(()=>{'use strict';
const notice=document.getElementById('journeyResume'),button=document.getElementById('startJourney'),progress=document.getElementById('resumeProgress');
const route=[];window.NOVEL_PANELS.forEach((rows,chapter)=>rows.forEach(([asset])=>{route.push({chapter,asset});for(const shot of window.YITING_EXTRA_SHOTS||[])if(shot.chapter===chapter&&shot.after===asset)route.push({chapter,asset:shot.asset});}));
function refresh(){
 button.textContent='開啟旅程 →';notice.textContent='第一次來到這裡？從城市裡的星光開始，也可以自由選擇章節。';progress.hidden=true;
 let saved;try{saved=JSON.parse(localStorage.getItem('yiting-explore-story-v1')||'null');}catch{return;}
 if(!saved||!Number.isInteger(saved.index)||saved.index<0||saved.index>route.length)return;
 const assets=new Set(route.map(row=>row.asset)),readCount=Array.isArray(saved.completed)?new Set(saved.completed.filter(asset=>assets.has(asset))).size:Math.max(saved.index,Number.isInteger(saved.unlocked)&&saved.unlocked>=0&&saved.unlocked<=route.length?saved.unlocked:0);
 const revisit=saved.revisit;if(saved.mapVersion===2&&revisit&&Number.isInteger(revisit.index)&&revisit.index>=0&&revisit.index<=route.length&&(Array.isArray(saved.completed)||Number.isInteger(saved.unlocked)&&revisit.index<=saved.unlocked)&&Number.isFinite(revisit.x)){const chapter=window.YITING_NOVEL_CHAPTERS[route[Math.min(saved.index,route.length-1)].chapter];button.textContent=saved.index<revisit.index?'接續重溫 →':'接續選章 →';notice.textContent='正在閱讀'+chapter.title+' · 已讀 '+readCount+' / '+route.length+' 格。原旅程 '+revisit.index+' / '+route.length+' 格位置已保留，進入後可回到剛才的位置。';progress.max=route.length;progress.value=readCount;progress.hidden=false;return;}
 const index=saved.index,started=readCount>0||index>0||Number.isFinite(saved.x)&&saved.x>180||saved.reading&&typeof saved.reading.asset==='string'&&Number.isInteger(saved.reading.line)&&saved.reading.line>0;
 if(!started)return;
 progress.max=route.length;progress.value=readCount;progress.hidden=false;
 if(index===route.length){button.textContent='重返星光旅程 →';notice.textContent=readCount===route.length?'已走完整段旅程 · '+route.length+' / '+route.length+' 格。再回去看看熟悉的星光吧。':'已到達故事終點 · 已讀 '+readCount+' / '+route.length+' 格。隨時選章，繼續看看其他故事。';return;}
 const chapter=window.YITING_NOVEL_CHAPTERS[route[index].chapter];
 button.textContent='接續旅程 →';notice.textContent='上次停在'+chapter.title+' · 已讀 '+readCount+' / '+route.length+' 格。';
}
window.addEventListener('pageshow',refresh);window.addEventListener('storage',event=>{if(event.key===null||event.key==='yiting-explore-story-v1')refresh();});refresh();
})();
