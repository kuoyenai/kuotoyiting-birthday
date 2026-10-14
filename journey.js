(()=>{
const key='yiting-journey',page=location.pathname.split('/').pop()||'index.html';
const read=()=>{try{return JSON.parse(localStorage.getItem(key))||{};}catch{return {};}};
const save=(mode,value)=>{try{const data=read();data[mode]={...data[mode],...value,updated:Date.now()};localStorage.setItem(key,JSON.stringify(data));}catch{}};
const modes={'movie.html':'movie','game.html':'comic','novel-comic.html':'novel','gift.html':'gift'};
if(page==='movie.html'){const film=document.getElementById('film');let last=-1;film.addEventListener('timeupdate',()=>{if(Math.abs(film.currentTime-last)>=1){last=film.currentTime;save('movie',{position:film.currentTime,total:film.duration||62});}});film.addEventListener('ended',()=>save('movie',{done:true}));}
if(page==='game.html'||page==='novel-comic.html'){
 const mode=modes[page],counter=document.getElementById(mode==='comic'?'count':'pageCount');let previous='';
 const finish=document.createElement('button');finish.type='button';finish.className='journey-finish';finish.textContent='這個故事，我看完了 ✓';document.querySelector('main').append(finish);
 const update=()=>{const values=counter.textContent.match(/\d+/g);if(!values)return;const position=Number(values[0]),total=Number(values[1]);finish.hidden=position!==total;const stamp=position+'/'+total;if(stamp!==previous){previous=stamp;save(mode,{position,total,...(mode==='novel'?{chapter:Number(document.body.dataset.storyChapter),spread:null}:{})});}finish.textContent=read()[mode]?.done?'已完成這個故事 ✓':'這個故事，我看完了 ✓';};
 finish.onclick=()=>{save(mode,{done:true});update();};new MutationObserver(update).observe(counter,{childList:true,subtree:true});update();
}
if(page==='gift.html')save('gift',{visited:true});
if(page==='index.html'){
 const data=read();try{if(!data.movie&&localStorage.getItem('yiting-film-progress'))data.movie={position:Number(localStorage.getItem('yiting-film-progress')),total:62};if(!data.comic&&localStorage.getItem('yiting-motion-comic-v2'))data.comic={position:JSON.parse(localStorage.getItem('yiting-motion-comic-v2')).page+1,total:7};if(!data.novel&&localStorage.getItem('yiting-novel-comic-page')!==null)data.novel={position:Number(localStorage.getItem('yiting-novel-comic-page'))+1,total:10};}catch{}
 document.querySelectorAll('.album-item').forEach(item=>{const mode=modes[item.getAttribute('href')],p=data[mode],badge=document.createElement('span');badge.className='journey-badge';badge.textContent=!p?'尚未開始':p.done?'已看完 ✓':mode==='gift'?'已開啟收藏':mode==='movie'?'看到 '+Math.floor(p.position)+' 秒':mode==='novel'?'閱讀'+(window.yitingNovelChapter(Number.isInteger(p.chapter)?p.chapter:p.position-1)?.label||'故事')+' · '+p.position+' / '+p.total+' 段':'閱讀第 '+p.position+' / '+p.total+' 回';item.append(badge);});
 const latest=Object.entries(data).filter(([mode,p])=>modes[Object.keys(modes).find(k=>modes[k]===mode)]&&!p.done).sort((a,b)=>(b[1].updated||0)-(a[1].updated||0))[0];const link=document.getElementById('continueJourney');link.hidden=!latest;
 if(latest){const [mode,p]=latest;link.href=mode==='movie'?'movie.html?resume=1':mode==='novel'?'novel-comic.html#chapter-'+Math.max(0,Number.isInteger(p.chapter)?p.chapter:p.position-1):mode==='comic'?'game.html':'gift.html';link.textContent=mode==='gift'?'回到生日收藏 →':'繼續'+({movie:'生日電影',comic:'電影互動漫畫',novel:'小說漫畫'}[mode])+' →';}
}
})();
