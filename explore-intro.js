(()=>{'use strict';
const notice=document.getElementById('journeyResume'),button=document.getElementById('startJourney'),progress=document.getElementById('resumeProgress');
const route=[];window.NOVEL_PANELS.forEach((rows,chapter)=>rows.forEach(([asset])=>{route.push(chapter);for(const shot of window.YITING_EXTRA_SHOTS||[])if(shot.chapter===chapter&&shot.after===asset)route.push(chapter);}));
function refresh(){
 button.textContent='開啟旅程 →';notice.textContent='第一次來到這裡？從城市裡的星光開始。';progress.hidden=true;
 let saved;try{saved=JSON.parse(localStorage.getItem('yiting-explore-story-v1')||'null');}catch{return;}
 if(!saved||!Number.isInteger(saved.index)||saved.index<0||saved.index>route.length)return;
 const index=saved.index,started=index>0||Number.isFinite(saved.x)&&saved.x>180||saved.reading&&typeof saved.reading.asset==='string'&&Number.isInteger(saved.reading.line)&&saved.reading.line>0;
 if(!started)return;
 progress.max=route.length;progress.value=index;progress.hidden=false;
 if(index===route.length){button.textContent='重返星光旅程 →';notice.textContent='已走完整段旅程 · '+route.length+' / '+route.length+' 格。再回去看看熟悉的星光吧。';return;}
 const chapter=window.YITING_NOVEL_CHAPTERS[route[index]];
 button.textContent='接續旅程 →';notice.textContent='上次停在'+chapter.title+' · 已讀 '+index+' / '+route.length+' 格。';
}
window.addEventListener('pageshow',refresh);window.addEventListener('storage',event=>{if(event.key===null||event.key==='yiting-explore-story-v1')refresh();});refresh();
})();
