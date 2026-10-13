(()=>{
'use strict';
const secret=document.getElementById('secret'),finale=document.getElementById('finale');if(!secret)return;
const chapters=[
 {title:'01 · 舞台安靜之後',image:'assets/novel-eunho-memento.webp',words:'舞台的燈慢慢暗下。藝俊、諾亞、斑比與河玟在遠處向妳揮手，銀虎卻多停了一步。\n「YiTing，先等一下。」他攤開手心，紅色星光像心跳一樣，安靜地亮著。'},
 {title:'02 · 留在掌心的溫度',image:'assets/novel-keepsake-closeup.webp',words:'「不用把今晚的每一秒都記住。」銀虎笑了笑。\n「只要有一天，妳聽到熟悉的歌，忽然覺得自己又有力氣往前走——那就夠了。」\n他把小小的紅星交給妳，讓妳選擇想帶回日常的心意。'},
 {title:'03 · 10:21，故事還在繼續',image:'assets/novel-city-return-wide.webp',words:'妳回到熟悉的城市。時鐘走到了 10:21，車燈與人聲重新流動。\n掌心裡的紅星仍有一點溫度。五道星光留在歌裡，而接下來的故事，輪到妳慢慢寫。\n2026 年 10 月 20 日，生日快樂，YiTing。'}
];
const choices=[['我想把勇氣帶回去。','銀虎點了點頭。「那就從一件妳想做的小事開始。慢慢來，也很好。」'],['今晚，我想先好好休息。','銀虎放輕了聲音。「那就安心休息吧。紅星會替妳記著，妳今天已經很努力。」'],['我會記得，自己值得被珍惜。','銀虎笑了。「對，就是這一句。下一次聽歌的時候，也把它說給自己聽。」']];
let step=0,choice=-1;const storageKey='yiting-secret-response-2026';
try{const value=Number(localStorage.getItem(storageKey));if(localStorage.getItem(storageKey)!==null&&Number.isInteger(value)&&value>=0&&value<choices.length)choice=value;}catch{}
const scene=document.createElement('section');scene.className='ending-scene';scene.setAttribute('aria-label','銀虎的三幕隱藏故事');
scene.innerHTML='<p class="eyebrow">EUNHO · THE EXTRA MINUTE</p><h3 tabindex="-1"></h3><img width="1672" height="941" alt="" loading="lazy" decoding="async"><p class="ending-words"></p><div class="ending-choices" role="group" aria-label="選擇想帶回日常的心意"></div><p class="ending-response" role="status"></p><div class="letter-actions"><button type="button" class="ending-back">上一幕</button><button type="button" class="ending-next">下一幕 →</button></div><p class="ending-note" role="status"></p>';
secret.prepend(scene);
const title=scene.querySelector('h3'),image=scene.querySelector('img'),words=scene.querySelector('.ending-words'),buttons=scene.querySelector('.ending-choices'),response=scene.querySelector('.ending-response'),back=scene.querySelector('.ending-back'),next=scene.querySelector('.ending-next');
choices.forEach(([text],i)=>{const b=document.createElement('button');b.type='button';b.textContent=text;b.onclick=()=>{choice=i;try{localStorage.setItem(storageKey,String(i));scene.querySelector('.ending-note').textContent='這份心意已留在這台裝置。';}catch{scene.querySelector('.ending-note').textContent='瀏覽器無法保存，仍可閱讀結局並下載生日信。';}paint();};buttons.append(b);});
function paint(focus=false){const chapter=chapters[step];title.textContent=chapter.title;image.src=chapter.image;image.alt=chapter.title;words.textContent=chapter.words;buttons.hidden=step!==1;response.textContent=step===1&&choice>=0?choices[choice][1]:'';[...buttons.children].forEach((b,i)=>b.setAttribute('aria-pressed',String(choice===i)));back.disabled=step===0;next.disabled=step===2;next.textContent=step===2?'把故事留在心裡':'下一幕 →';if(focus)title.focus({preventScroll:true});}
back.onclick=()=>{step=Math.max(0,step-1);paint(true);};next.onclick=()=>{step=Math.min(2,step+1);paint(true);};
image.onerror=()=>{image.alt='插畫暫時無法載入，仍可閱讀這一幕的故事。';};
finale.addEventListener('click',()=>{step=0;paint(true);});paint();
try{if(localStorage.getItem('yiting-secret-ending')==='unlocked'){const found=JSON.parse(localStorage.getItem('yiting-five-stars')||'[]');if(new Set(found.filter(i=>Number.isInteger(i)&&i>=0&&i<5)).size===5)secret.hidden=false;}}catch{}
document.querySelectorAll('[data-star]').forEach(button=>{button.setAttribute('aria-pressed',String(button.classList.contains('collected')));button.addEventListener('click',()=>button.setAttribute('aria-pressed','true'));});
})();
