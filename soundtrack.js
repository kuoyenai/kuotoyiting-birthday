(()=>{
window.YITING_TRACKS=[
{title:'열 시 이십 분의 별',name:'열 시 이십 분의 별｜十點二十分的星',src:'assets/ten-twenty-star.m4a',video:'assets/ten-twenty-star.mp4',key:'first',duration:182},
{title:'너만을 위한 별빛',name:'너만을 위한 별빛｜只為妳閃耀的星光',src:'assets/gemini_generated_video_5D27E211.mp4',video:'assets/gemini_generated_video_5D27E211.mp4',key:'fourth',duration:182.8},
{title:'너라는_별빛',name:'너라는_별빛',src:'assets/song.m4a',video:'assets/starlight-song.mp4',key:'second',duration:62},
{title:'10월의 밤',name:'10월의 밤｜十月的夜晚',src:'assets/moon-night.m4a',video:'assets/moon-night.mp4',key:'third',duration:70}];
const key='yiting-music-preferences';
window.yitingMusicRead=()=>{try{const p=JSON.parse(localStorage.getItem(key))||{};return {index:Number.isInteger(p.index)&&p.index>=0&&p.index<4?p.index:0,paused:p.paused===true};}catch{return {index:0,paused:false};}};
window.yitingMusicSave=patch=>{try{localStorage.setItem(key,JSON.stringify({...window.yitingMusicRead(),...patch}));}catch{}};
window.yitingLyricPanel=(audio,getTrack,host)=>{
 const box=document.createElement('section');box.className='shared-lyrics';box.setAttribute('aria-label','目前歌曲雙語歌詞');box.innerHTML='<p class="lyric-original"></p><p class="lyric-translation"></p><label>歌曲進度 <input type="range" min="0" max="183" value="0" step="0.1" aria-label="歌曲播放進度"></label><a download>下載目前歌曲影片 ↓</a>';host.append(box);
 const range=box.querySelector('input'),save=box.querySelector('a');
 const update=()=>{const track=YITING_TRACKS[getTrack()],rows=window.BIRTHDAY_TIMED_LYRICS?.[track.key]||[];let cue;for(const row of rows){if(row[0]<=audio.currentTime)cue=row;else break;}box.querySelector('.lyric-original').textContent=cue?.[2]||'♪ '+track.title+' ♪';box.querySelector('.lyric-translation').textContent=cue?.[3]||'';range.max=Number.isFinite(audio.duration)?audio.duration:track.duration;if(!range.matches(':active'))range.value=audio.currentTime||0;save.href=track.video;save.download=track.title+'.mp4';save.textContent='下載 '+track.title+' 影片 ↓';};
 audio.addEventListener('timeupdate',update);audio.addEventListener('loadedmetadata',update);audio.addEventListener('emptied',update);range.oninput=()=>{if(audio.readyState>0)audio.currentTime=Number(range.value);};update();return update;
};
})();
