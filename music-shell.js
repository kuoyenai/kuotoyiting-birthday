(()=>{
const base=new URL('./',location.href),frame=document.getElementById('birthdayContent'),audio=document.getElementById('persistentMusic');
const allowed=new Set(['index.html','game.html','novel-comic.html','gift.html','starlight.html']);
let initial=new URLSearchParams(location.search).get('view')||'index.html',subscribers=new Set(),leaving=false;
function route(value,replace=false){const url=new URL(value,base);const file=url.pathname.split('/').pop()||'index.html';if(url.origin!==base.origin||!url.pathname.startsWith(base.pathname)||!allowed.has(file)){location.href=url.href;return;}if(!url.pathname.endsWith('.html'))url.pathname+='index.html';if(replace)history.replaceState({},'',url);else history.pushState({},'',url);frame.contentWindow.location.replace(url.href);}
const prefs=yitingMusicRead();audio.src=new URL(YITING_TRACKS[prefs.index].src,base).href;
function play(){if(!yitingMusicRead().paused)return audio.play().catch(()=>{});return Promise.resolve();}
window.yitingPersistent={audio,installEvent:null,subscribe(fn){subscribers.add(fn);return ()=>subscribers.delete(fn);},navigate:route,play};
['play','pause','playing','timeupdate','loadedmetadata','seeked','waiting','error','emptied','loadstart','ended'].forEach(name=>audio.addEventListener(name,()=>{for(const fn of [...subscribers])fn(name);if(name==='ended'&&!subscribers.size){const i=(yitingMusicRead().index+1)%YITING_TRACKS.length;yitingMusicSave({index:i});audio.src=new URL(YITING_TRACKS[i].src,base).href;play();}}));
window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();window.yitingPersistent.installEvent=e;});if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{});
let last=0;audio.addEventListener('timeupdate',()=>{if(Date.now()-last<750)return;last=Date.now();try{const positions=JSON.parse(localStorage.getItem('yiting-music-positions')||'{}');positions[YITING_TRACKS[yitingMusicRead().index].key]=audio.currentTime;localStorage.setItem('yiting-music-positions',JSON.stringify(positions));}catch{}});
audio.addEventListener('loadedmetadata',()=>{if(audio.currentTime>0)return;try{const t=JSON.parse(localStorage.getItem('yiting-music-positions')||'{}')[YITING_TRACKS[yitingMusicRead().index].key];if(t>0&&t<audio.duration-1)audio.currentTime=t;}catch{}});
window.addEventListener('popstate',()=>{const target=new URL(location.href);if(frame.contentWindow.location.href!==target.href)frame.contentWindow.location.replace(target.href);});
frame.addEventListener('load',()=>{try{document.title=frame.contentDocument.title;}catch{}if(!leaving)play();});
window.addEventListener('beforeunload',()=>{leaving=true;});document.addEventListener('visibilitychange',()=>{if(!document.hidden)play();});
route(initial,true);play();
})();