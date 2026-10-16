(()=>{
const base=new URL('./',location.href),frame=document.getElementById('birthdayContent'),audio=document.getElementById('persistentMusic');
const allowed=new Set(['index.html','game.html','novel-comic.html','gift.html','starlight.html']);
let initial=new URLSearchParams(location.search).get('view')||'index.html',subscribers=new Set(),leaving=false,restartSource=null;
function route(value,replace=false){const url=new URL(value,base);const file=url.pathname.split('/').pop()||'index.html';if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname)||!allowed.has(file)){location.href=url.href;return;}if(!url.pathname.endsWith('.html'))url.pathname+='index.html';if(replace)history.replaceState({},'',url);else history.pushState({},'',url);frame.contentWindow.location.replace(url.href);}
const prefs=yitingMusicRead();audio.src=new URL(YITING_TRACKS[prefs.index].src,base).href;
function play(){if(frame.contentDocument?.querySelector('dialog[open] video'))return Promise.resolve();if(!yitingMusicRead().paused)return audio.play().catch(()=>{});return Promise.resolve();}
window.yitingPersistent={audio,installEvent:null,subscribe(fn){subscribers.add(fn);return ()=>subscribers.delete(fn);},navigate:route,play};
const trackIndex=()=>{const index=YITING_TRACKS.findIndex(t=>new URL(t.src,base).href===audio.src);return index<0?yitingMusicRead().index:index;};
const readPositions=()=>{try{const value=JSON.parse(localStorage.getItem('yiting-music-positions')||'{}');return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}catch{return {};}};
const writePositions=value=>{try{localStorage.setItem('yiting-music-positions',JSON.stringify(value));}catch{}};
['play','pause','playing','timeupdate','loadedmetadata','seeked','waiting','error','emptied','loadstart','ended'].forEach(name=>audio.addEventListener(name,()=>{
 if(name==='ended'){
  const previous=trackIndex(),next=(previous+1)%YITING_TRACKS.length,positions=readPositions();
  positions[YITING_TRACKS[previous].key]=0;positions[YITING_TRACKS[next].key]=0;writePositions(positions);
  restartSource=new URL(YITING_TRACKS[next].src,base).href;
  yitingMusicSave({index:next});audio.src=restartSource;play();
 }
 for(const fn of [...subscribers])fn(name);
}));
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.yitingPersistent.installEvent=e;});if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{});
let last=0;
function savePosition(force=false){if(!audio.readyState||restartSource||audio.seeking||audio.ended)return;if(!force&&Date.now()-last<750)return;last=Date.now();const positions=readPositions();positions[YITING_TRACKS[trackIndex()].key]=audio.currentTime;writePositions(positions);}
audio.addEventListener('timeupdate',()=>savePosition());audio.addEventListener('pause',()=>savePosition(true));window.addEventListener('pagehide',()=>savePosition(true));
audio.addEventListener('loadedmetadata',()=>{
 const restart=restartSource===audio.src;restartSource=null;
 if(restart){audio.currentTime=0;return;}
 if(audio.currentTime>0)return;const t=Number(readPositions()[YITING_TRACKS[trackIndex()].key]);
 if(Number.isFinite(t)&&t>0&&t<audio.duration-1)audio.currentTime=t;
});
window.addEventListener('popstate',()=>{const target=new URL(location.href);if(frame.contentWindow.location.href!==target.href)frame.contentWindow.location.replace(target.href);});
frame.addEventListener('load',()=>{
 try{
  const child=new URL(frame.contentWindow.location.href),page=child.pathname.split('/').pop()||'index.html';
  if(child.origin===base.origin&&page==='movie.html'){leaving=true;audio.pause();location.replace(child.href);return;}
  document.title=frame.contentDocument.title;
 }catch{}
 if(!leaving)play();
});
window.addEventListener('beforeunload',()=>{leaving=true;});document.addEventListener('visibilitychange',()=>{if(!document.hidden)play();});
route(initial,true);play();
})();
