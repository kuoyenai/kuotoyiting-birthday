(()=>{'use strict';
const canvas=document.getElementById('world'),label=document.getElementById('sceneLabel'),stage=document.querySelector('.stage');if(!canvas||!label||!stage)return;
const locations={city:['雨夜城市','#c5a2ef'],'portal-city':['十點二十分的奇蹟','#c5a2ef'],asterum:['歡迎來到 ASTERUM','#c5a2ef'],garden:['藝俊的音樂花園','#77baff'],greenhouse:['諾亞的月光溫室','#c5a2ef'],plaza:['斑比的粉色廣場','#f2a3c0'],observatory:['河玟的觀景台','#8dd2b0'],eunho:['銀虎的星光步道','#e57291'],birthday:['只為妳亮起的舞台','#e7c789'],wish:['只屬於妳的願望','#e7c789'],farewell:['帶著星光再相遇','#e57291']};
const motion=matchMedia('(prefers-reduced-motion: reduce)'),status=document.createElement('span');status.id='sceneArrivalStatus';status.className='scene-arrival-status';status.setAttribute('role','status');status.setAttribute('aria-atomic','true');stage.append(status);
let key='',animation;
function sync(){
 const id=canvas.dataset.scene,text=label.textContent||'',next=id+'|'+text;if(!locations[id]||!text||key===next)return;key=next;
 const [name,color]=locations[id],title=id==='city'&&text.includes('LIGHT STAYS')?'帶著星光回到日常':name;
 stage.style.setProperty('--scene-accent',color);stage.style.setProperty('--scene-edge',color+'66');stage.dataset.arrivalScene=id;
 label.setAttribute('aria-label',title+' · '+text);status.textContent='來到'+title+'。';
 animation?.cancel();animation=null;
 if(!motion.matches&&typeof label.animate==='function')animation=label.animate([{opacity:.45,transform:'translateX(-4px)'},{opacity:1,transform:'translateX(0)'}],{duration:700,easing:'ease-out'});
}
new MutationObserver(sync).observe(canvas,{attributes:true,attributeFilter:['data-scene']});new MutationObserver(sync).observe(label,{childList:true,characterData:true,subtree:true});
motion.addEventListener('change',()=>{animation?.cancel();animation=null;});sync();
})();
