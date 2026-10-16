(()=>{
if(window.parent===window||!parent.yitingPersistent)return;const manager=parent.yitingPersistent,real=manager.audio;
const proxy=document.querySelector('audio#homeSong,audio#comicMusic,audio#bgm,audio#song');
if(proxy){proxy.dataset.persistent='true';proxy.removeAttribute('src');
['currentTime','volume','muted','playbackRate'].forEach(key=>Object.defineProperty(proxy,key,{get:()=>real[key],set:value=>{real[key]=value;}}));
['paused','duration','readyState','ended','error','currentSrc','buffered','seeking'].forEach(key=>Object.defineProperty(proxy,key,{get:()=>real[key]}));
Object.defineProperty(proxy,'src',{get:()=>real.src,set:value=>{const next=new URL(value,document.baseURI).href;if(real.src!==next)real.src=next;}});
Object.defineProperty(proxy,'loop',{get:()=>false,set:()=>{}});proxy.play=()=>real.play();proxy.pause=()=>real.pause();proxy.load=()=>real.load();
const detach=manager.subscribe(name=>{if(name!=='ended')proxy.dispatchEvent(new Event(name));});window.addEventListener('pagehide',detach,{once:true});
}
document.addEventListener('click',event=>{if(event.defaultPrevented||event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;const a=event.target.closest('a[href]');if(a&&!a.download&&a.target!=='_blank'){const url=new URL(a.href);if(url.origin===location.origin&&url.pathname!==location.pathname){event.preventDefault();manager.navigate(url.href);return;}}
if(!event.target.closest('.audio-play,#homeMusic,#music,#listen,#novelListen,#musicToggle')&&manager.audio.paused&&parent.yitingMusicRead?.().paused===false)manager.play().catch(()=>{});},{capture:true});
// Keep deep links and chapter changes reflected in the installed App URL.
for(const method of ['replaceState','pushState']){const original=history[method].bind(history);history[method]=function(state,title,url){original(state,title,url);parent.history.replaceState({},'',location.href);};}
window.addEventListener('hashchange',()=>parent.history.replaceState({},'',location.href));
})();
