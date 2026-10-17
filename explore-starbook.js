(()=>{'use strict';
const dialog=document.getElementById('keepsakeDialog'),caption=dialog?.querySelector('.keepsake-caption'),canvas=document.getElementById('world');if(!caption||!canvas)return;
const route=[];window.NOVEL_PANELS.forEach((rows,chapter)=>rows.forEach(([asset,narration,lines,star],panel)=>{route.push({asset,narration,lines,star,chapter,panel});for(const shot of window.YITING_EXTRA_SHOTS||[])if(shot.chapter===chapter&&shot.after===asset)route.push({...shot,chapter});}));
const members=[['blue','藝俊','希望','#77baff'],['purple','諾亞','溫柔','#c5a2ef'],['pink','斑比','快樂','#f2a3c0'],['green','河玟','勇氣','#8dd2b0'],['red','銀虎','陪伴','#e57291']];
const details=document.createElement('details');details.id='starbook';details.className='starbook';const summary=document.createElement('summary');summary.textContent='五道星光，五次相遇';const pages=document.createElement('div');pages.className='starbook-pages';pages.id='starbookPages';details.append(summary,pages);caption.after(details);
function clear(){for(const image of pages.querySelectorAll('img')){image.onload=null;image.onerror=null;image.removeAttribute('src');}pages.replaceChildren();}
function render(){
 clear();let saved={};try{saved=JSON.parse(localStorage.getItem('yiting-explore-story-v1')||'{}')||{};}catch{}
 const valid=n=>Number.isInteger(n)&&n>=0&&n<=route.length;
 const unlocked=Math.max(valid(saved.unlocked)?saved.unlocked:0,valid(saved.index)?saved.index:0,Number(canvas.dataset.index)||0);
 for(const [color,name,theme,ink]of members){
  const i=route.findIndex(row=>row.star===color),row=route[i],owned=i>=0&&i<unlocked,article=document.createElement('article');article.dataset.star=color;article.style.setProperty('--starbook-ink',ink);
  const title=document.createElement('h3');title.textContent=name+' · '+theme;article.append(title);
  if(owned){const image=document.createElement('img');image.alt=row.narration;image.width=1672;image.height=941;image.loading='lazy';image.decoding='async';image.src='assets/'+row.asset+'.webp';const quote=document.createElement('p'),line=(row.lines||[]).filter(([speaker])=>speaker===name).at(-1);quote.textContent=line?name+'：「'+line[1]+'」':row.narration;
   const status=document.createElement('p');status.className='starbook-art-status';status.hidden=true;const retry=document.createElement('button');retry.type='button';retry.hidden=true;retry.textContent='重新載入插畫';image.onerror=()=>{status.textContent='插畫暫時無法載入，文字仍可重溫。';status.hidden=false;retry.hidden=false;};image.onload=()=>{status.hidden=true;retry.hidden=true;};retry.onclick=()=>{image.src='assets/'+row.asset+'.webp?retry='+Date.now();};
   const link=document.createElement('a');link.href='novel-comic.html#chapter-'+row.chapter+'-panel-'+row.panel;link.textContent='回到這段故事 →';article.append(image,quote,status,retry,link);
  }else{const waiting=document.createElement('p');waiting.textContent='這道星光，還在前方等妳。';article.append(waiting);}
  pages.append(article);
 }
}
details.addEventListener('toggle',()=>{if(details.open)render();else clear();});dialog.addEventListener('close',()=>{details.open=false;clear();});
})();
