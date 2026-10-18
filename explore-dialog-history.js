(()=>{'use strict';
const field='yitingExploreDialog';let stack=[],returning=false,sequence=0,available=true;
function clean(state){const next=state&&typeof state==='object'?{...state}:{};delete next[field];return next;}
function normalize(){const token=stack.at(-1)?.token,next=clean(history.state);if(token)next[field]=token;try{history.replaceState(next,'');}catch{available=false;}}
if(history.state?.[field])try{history.replaceState(clean(history.state),'');}catch{available=false;}
function opened(){return Array.from(document.querySelectorAll('dialog[open]')).at(-1);}
function remember(dialog){window.dispatchEvent(new Event('yiting-explore-modal'));const token=++sequence;try{history.pushState({...clean(history.state),[field]:token},'');stack.push({dialog,token});}catch{available=false;}}
function sync(){
 if(!available||returning)return;
 while(stack.length&&!stack.at(-1).dialog.open){const old=stack.pop();if(history.state?.[field]===old.token){returning=true;try{history.back();}catch{returning=false;available=false;}return;}}
 const dialog=opened();if(dialog&&stack.at(-1)?.dialog!==dialog)remember(dialog);
}
window.addEventListener('popstate',event=>{
 if(returning){returning=false;if(event.state?.[field]!==stack.at(-1)?.token)normalize();sync();return;}
 const target=Number(event.state?.[field])||0,top=stack.at(-1);
 if(target>(top?.token??0)){returning=true;try{history.back();}catch{returning=false;available=false;}return;}
 if(top&&target<top.token){while(stack.length&&stack.at(-1).token!==target){const old=stack.pop();if(old.dialog.open)old.dialog.close();}}
 // Forward never reopens a stale overlay or changes its reading bookmark.
 if(target!==stack.at(-1)?.token)normalize();sync();
});
new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});sync();
})();
