(()=>{'use strict';
const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),dialog=$('story'),music=$('music');
const city=new Image(),sprite=new Image();city.src='assets/explore-city-v1.png';sprite.src='assets/explore-yiting-walk-v1.png';
const frames=[[28,18,250,705],[326,18,370,705],[677,18,310,705],[1000,18,410,705],[1400,18,345,705],[1790,18,250,705]];
let x=180,target=180,speed=0,facing=1,step=0,phase=0,line=0,camera=0,vw=1600,last=0,walkingTime=0,muted=false,ready=false,completed=false;
const keys=new Set(),reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const conversations=[['銀虎','YiTing，聽得到嗎？別害怕，我們只是借用了一點點時間。'],['銀虎','今天的妳，也值得一場特別的相遇。沿著紅色星光，來找我們吧。'],['YiTing','這個聲音……是銀虎？原來，今晚的星光真的在等我。']];
function audio(){if(!muted)music.play().catch(()=>{});}function stop(){keys.clear();target=x;speed=0;}
function openStory(){stop();line=0;$('storyArt').src=phase===0?'assets/novel-invitation-closeup-v2.webp':'assets/novel-asterum-panorama.webp';$('storyArt').alt=phase===0?'銀虎透過星光向 YiTing 傳來邀請':'通往 ASTERUM 的星光城市';paintStory();dialog.showModal();}
function paintStory(){const row=phase===0?conversations[line]:['星光入口','另一個世界的相遇，正要開始。這段試玩到這裡，謝謝妳走進今晚的星光。'];$('speaker').textContent=row[0];$('line').textContent=row[1];$('continue').textContent=phase===0&&line<2?'繼續 →':phase===0?'收下邀請':'回到城市';}
$('continue').onclick=()=>{if(phase===0&&line<2){line++;paintStory();return;}dialog.close();if(phase===0){phase=1;$('objective').textContent='帶著邀請，往右走向星光入口。';$('progress').textContent='02 / 03 · 走向星光';}else{phase=2;completed=true;$('objective').textContent='已完成序章試玩。下一次，將走進 PLAVE 的世界。';$('progress').textContent='03 / 03 · 序章完成';}update();};
dialog.addEventListener('cancel',()=>{stop();});
function update(){const near=Math.abs(x-(phase===0?720:1370))<130;$('interact').disabled=!ready||!near||completed;$('interact').textContent=completed?'序章已完成':near?(phase===0?'✦ 讀取銀虎來信':'✦ 走進星光入口'):(phase===0?'走近紅色星光':'往右尋找星光入口');}
$('interact').onclick=()=>{if(!$('interact').disabled)openStory();};
function position(e){const r=canvas.getBoundingClientRect();target=Math.max(80,Math.min(1520,camera+(e.clientX-r.left)/r.width*vw));audio();canvas.focus({preventScroll:true});}
canvas.addEventListener('pointerdown',e=>{if(ready&&!dialog.open&&!completed)position(e);});
window.addEventListener('keydown',e=>{if(dialog.open||e.ctrlKey||e.metaKey||e.altKey||e.target.closest('button,a'))return;if(['ArrowLeft','ArrowRight','a','d','A','D'].includes(e.key)){e.preventDefault();keys.add(e.key.toLowerCase());audio();}if(e.key.toLowerCase()==='e')$('interact').click();});
window.addEventListener('keyup',e=>{const key=e.key.toLowerCase();keys.delete(key);if(['arrowleft','arrowright','a','d'].includes(key)&&keys.size===0)target=x;});window.addEventListener('blur',stop);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});
for(const [id,key] of [['left','arrowleft'],['right','arrowright']]){const b=$(id);b.addEventListener('pointerdown',e=>{if(dialog.open||completed)return;e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(key);audio();});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>{keys.delete(key);target=x;});}
$('sound').onclick=()=>{muted=!muted;if(muted)music.pause();else audio();$('sound').textContent=muted?'音樂關閉':'音樂開啟';$('sound').setAttribute('aria-pressed',String(!muted));};
$('restart').onclick=()=>{if(dialog.open)dialog.close();stop();x=target=180;phase=0;completed=false;$('objective').textContent='走近街角的紅色星光，看看是誰留下了訊息。';$('progress').textContent='01 / 03 · 尋找來信';update();};
function draw(t){const dt=Math.min((t-last)/1000||0,.04);last=t;const w=canvas.clientWidth,h=canvas.clientHeight,dpr=Math.min(devicePixelRatio||1,2);if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);}ctx.setTransform(dpr,0,0,dpr,0,0);vw=Math.min(1600,900*w/h);const scale=w/vw;camera=Math.max(0,Math.min(1600-vw,x-vw*.4));
if(ready){let dir=keys.has('arrowright')||keys.has('d')?1:keys.has('arrowleft')||keys.has('a')?-1:0;if(dir)target=Math.max(80,Math.min(1520,x+dir*160));const distance=target-x;const desired=!dialog.open&&!completed&&Math.abs(distance)>3?Math.sign(distance)*Math.min(180,Math.abs(distance)*4):0;speed+=(desired-speed)*(1-Math.exp(-dt*12));x=Math.max(80,Math.min(1520,x+speed*dt));if(Math.abs(speed)>8){facing=Math.sign(speed);walkingTime+=dt;step=[1,2,3,4][Math.floor(walkingTime*7)%4];}else step=0;
ctx.drawImage(city,-camera*scale,0,1600*scale,h);const ground=h*.85;const point=(phase===0?720:1370)-camera;ctx.save();ctx.translate(point*scale,ground-120*scale);ctx.shadowColor=phase===0?'#ef5b82':'#d7aaff';ctx.shadowBlur=25;ctx.fillStyle=phase===0?'#e46b8a':'#dfc8ff';const pulse=reduced?1:1+Math.sin(t*.003)*.1;ctx.font=`${50*scale*pulse}px serif`;ctx.textAlign='center';if(!completed)ctx.fillText(phase===0?'✦':'◌',0,0);ctx.restore();
const [sx,sy,sw,sh]=frames[step],size=h*.39/705;ctx.save();ctx.translate((x-camera)*scale,ground);ctx.scale(facing,1);ctx.drawImage(sprite,sx,sy,sw,sh,-sw*size/2,-sh*size,sw*size,sh*size);ctx.restore();if(!reduced){ctx.fillStyle='#f6dbbe88';for(let i=0;i<12;i++){const px=((i*137+t*.009)%1600-camera)*scale,py=h*(.15+(i%5)*.11);ctx.fillRect(px,py,1.5,1.5);}}update();canvas.dataset.phase=String(phase);canvas.dataset.playerX=String(Math.round(x));canvas.dataset.facing=String(facing);
}requestAnimationFrame(draw);}
Promise.all([city.decode(),sprite.decode()]).then(()=>{ready=true;$('loading').hidden=true;update();}).catch(()=>{$('loading').textContent='素材暫時無法載入，請重新整理再試。';});requestAnimationFrame(draw);
})();

(()=>{for(const element of document.querySelectorAll('.controls,#world,#interact')){element.addEventListener('contextmenu',event=>event.preventDefault());element.addEventListener('selectstart',event=>event.preventDefault());}})();
