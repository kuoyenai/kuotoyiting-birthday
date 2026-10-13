(()=>{
window.YITING_TRACKS=[
{title:'열 시 이십 분의 별',name:'열 시 이십 분의 별｜十點二十分的星',src:'assets/ten-twenty-star.m4a',video:'assets/ten-twenty-star.mp4',key:'first',duration:182.276},
{title:'너만을 위한 별빛',name:'너만을 위한 별빛｜只為妳閃耀的星光',src:'assets/only-for-you.m4a',video:'assets/gemini_generated_video_5D27E211.mp4',key:'fourth',duration:182.752},
{title:'너라는 별빛',name:'너라는 별빛｜妳這道星光',src:'assets/song.m4a',video:'assets/starlight-song.mp4',key:'second',duration:62.113},
{title:'10월의 밤',name:'10월의 밤｜十月的夜晚',src:'assets/moon-night.m4a',video:'assets/moon-night.mp4',key:'third',duration:70}];
const key='yiting-music-preferences';
window.yitingMusicRead=()=>{try{const p=JSON.parse(localStorage.getItem(key))||{};return {index:Number.isInteger(p.index)&&p.index>=0&&p.index<4?p.index:0,paused:p.paused===true};}catch{return {index:0,paused:false};}};
window.yitingMusicSave=patch=>{try{localStorage.setItem(key,JSON.stringify({...window.yitingMusicRead(),...patch}));}catch{}};
window.yitingTime=t=>{t=Number.isFinite(t)?Math.max(0,t):0;return String(Math.floor(t/60)).padStart(2,'0')+':'+String(Math.floor(t%60)).padStart(2,'0');};
window.yitingCue=(index,time)=>{const rows=window.BIRTHDAY_TIMED_LYRICS?.[YITING_TRACKS[index]?.key]||[];let cue,heading='INSTRUMENTAL',number=0;for(const row of rows){if(row[0]>time)break;cue=row;number++;if(row[1])heading=row[1];}return {ko:cue?.[2]||'♪ '+YITING_TRACKS[index].title+' ♪',zh:cue?.[3]||'',heading,number,total:rows.length};};
const bound=new WeakMap(),positionKey='yiting-music-positions';
const positions=()=>{try{const p=JSON.parse(localStorage.getItem(positionKey));return p&&typeof p==='object'&&!Array.isArray(p)?p:{};}catch{return {};}};
window.yitingBindAudio=(audio,getTrack,host)=>{
 if(bound.has(audio))return bound.get(audio);
 audio.preload='metadata';audio.loop=false;
 const notice=document.createElement('div');notice.className='soundtrack-status';const message=document.createElement('span');message.setAttribute('role','status');const retry=document.createElement('button');retry.type='button';retry.textContent='重試播放';retry.hidden=true;notice.append(message,retry);(host||audio.parentElement).append(notice);
 let lastWrite=0,failed=false,restoring=false,loadedIndex=-1;
 const matches=()=>YITING_TRACKS[getTrack()]&&new URL(YITING_TRACKS[getTrack()].src,document.baseURI).href===audio.src;
 const save=(force=false)=>{if(!matches()||loadedIndex!==getTrack()||!audio.readyState||restoring||failed)return;if(!force&&Date.now()-lastWrite<750)return;lastWrite=Date.now();try{localStorage.setItem(positionKey,JSON.stringify({...positions(),[YITING_TRACKS[getTrack()].key]:audio.ended?0:audio.currentTime}));}catch{}};
 const restore=()=>{if(!matches())return;loadedIndex=getTrack();failed=false;retry.hidden=true;const t=Number(positions()[YITING_TRACKS[getTrack()].key]);if(Number.isFinite(t)&&t>0&&Number.isFinite(audio.duration)&&t<audio.duration-1){restoring=true;audio.currentTime=t;}else restoring=false;};
 audio.addEventListener('loadstart',()=>{loadedIndex=-1;failed=false;retry.hidden=true;message.textContent='正在準備歌曲…';});
 audio.addEventListener('loadedmetadata',restore);audio.addEventListener('seeked',()=>{restoring=false;save(true);});audio.addEventListener('timeupdate',()=>save());
 audio.addEventListener('pause',()=>{save(true);if(!failed)message.textContent=document.hidden?'已暫停，回來後可繼續播放。':'歌曲已暫停';});
 audio.addEventListener('playing',()=>{failed=false;retry.hidden=true;message.textContent='正在播放：'+YITING_TRACKS[getTrack()].title;});
 audio.addEventListener('waiting',()=>{message.textContent='歌曲緩衝中，請稍候…';});
 audio.addEventListener('error',()=>{failed=true;retry.hidden=false;message.textContent=navigator.onLine?'歌曲無法載入，請重試或下載原影片。':'目前離線，歌曲需要網路；連線後可重試。';});
 audio.addEventListener('ended',()=>{if(loadedIndex<0)return;try{localStorage.setItem(positionKey,JSON.stringify({...positions(),[YITING_TRACKS[loadedIndex].key]:0}));}catch{}});
 retry.onclick=()=>{failed=false;audio.dispatchEvent(new Event('yiting-retry'));audio.load();yitingMusicSave({paused:false});audio.play().catch(()=>{message.textContent='請確認網路後，再輕觸重試播放。';retry.hidden=false;});};
 const suspend=()=>{save(true);audio.pause();};document.addEventListener('visibilitychange',()=>{if(document.hidden)suspend();});window.addEventListener('pagehide',suspend);
 window.addEventListener('online',()=>{if(failed)message.textContent='已恢復連線，輕觸重試播放。';});
 document.querySelectorAll('video').forEach(video=>video.addEventListener('play',()=>{if(!video.muted)audio.pause();}));
 const binding={save,restore,notice};bound.set(audio,binding);if(audio.readyState)restore();return binding;
};
window.yitingLyricPanel=(audio,getTrack,host)=>{
 const box=document.createElement('section');box.className='shared-lyrics';box.setAttribute('aria-label','目前歌曲雙語歌詞');box.innerHTML='<p class="lyric-original"></p><p class="lyric-translation"></p><label>歌曲進度 <input type="range" min="0" max="183" value="0" step="0.1" aria-label="歌曲播放進度"></label><a download>下載目前歌曲影片 ↓</a>';host.append(box);
 const range=box.querySelector('input'),save=box.querySelector('a'),time=document.createElement('p');time.className='soundtrack-time';range.parentElement.after(time);yitingBindAudio(audio,getTrack,box);let seeking=false;
 const update=()=>{const track=YITING_TRACKS[getTrack()],cue=yitingCue(getTrack(),audio.currentTime||0);box.querySelector('.lyric-original').textContent=cue.ko;box.querySelector('.lyric-translation').textContent=cue.zh;range.max=Number.isFinite(audio.duration)?audio.duration:track.duration;if(!seeking)range.value=audio.currentTime||0;time.textContent=yitingTime(audio.currentTime)+' / '+yitingTime(Number(range.max));range.setAttribute('aria-valuetext',time.textContent);save.href=track.video;save.download=track.title+'.mp4';save.textContent='下載 '+track.title+' 影片 ↓';};
 ['timeupdate','loadedmetadata','emptied','seeked','play','pause'].forEach(event=>audio.addEventListener(event,update));range.addEventListener('pointerdown',()=>seeking=true);range.addEventListener('pointerup',()=>{seeking=false;update();});range.addEventListener('pointercancel',()=>seeking=false);range.oninput=()=>{if(audio.readyState>0)audio.currentTime=Math.min(Number(range.value),Number(range.max));};update();return update;
};
})();
