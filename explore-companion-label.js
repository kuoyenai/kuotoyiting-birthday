(()=>{'use strict';
const stage=document.querySelector('.stage'),scene=document.getElementById('sceneLabel');if(!stage||!scene)return;
const names={yejun:['藝俊','#77baff'],noah:['諾亞','#c5a2ef'],bamby:['斑比','#f2a3c0'],hamin:['河玟','#8dd2b0'],eunho:['銀虎','#ed91a5']};
const label=document.createElement('span');label.id='companionLabel';label.className='companion-label';label.hidden=true;stage.append(label);
const status=document.createElement('span');status.className='scene-arrival-status';status.id='companionStatus';status.setAttribute('role','status');status.setAttribute('aria-atomic','true');stage.append(status);
const motion=matchMedia('(prefers-reduced-motion: reduce)');let member=null,animation=null;
function place(){label.style.top=(scene.offsetTop+scene.offsetHeight+6)+'px';}
function sync(next){if(next===member)return;member=next;animation?.cancel();animation=null;const info=names[member];label.hidden=!info;label.dataset.member=info?member:'';status.textContent=info?info[0]+'正陪著妳走向下一站。':'';if(!info)return;label.textContent=info[0]+' · 同行';label.style.setProperty('--companion-accent',info[1]);place();if(!motion.matches&&typeof label.animate==='function')animation=label.animate([{opacity:.4},{opacity:1}],{duration:350,easing:'ease-out'});}
window.addEventListener('yiting-explore-companion',event=>sync(event.detail?.member??null));
new ResizeObserver(place).observe(scene);window.addEventListener('resize',place);motion.addEventListener('change',()=>{animation?.cancel();animation=null;});sync(window.YitingActors?.follower?.member??null);
})();
