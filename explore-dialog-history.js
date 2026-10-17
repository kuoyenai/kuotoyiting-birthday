(()=>{'use strict';
const field='yitingExploreDialog';let active=null,returning=false,sequence=0,available=true;
function clean(state){const next=state&&typeof state==='object'?{...state}:{};delete next[field];return next;}
// A reload may restore a history marker without restoring the native dialog.
if(history.state?.[field])try{history.replaceState(clean(history.state),'');}catch{available=false;}
function opened(){return Array.from(document.querySelectorAll('dialog[open]')).at(-1);}
function remember(dialog){
 window.dispatchEvent(new Event('yiting-explore-modal'));
 const token=++sequence;
 try{history.pushState({...clean(history.state),[field]:token},'');active={dialog,token};}
 catch{available=false;/* Reading and closing still work if browser history is unavailable. */}
}
function sync(){
 if(!available)return;
 if(active&&!active.dialog.open){
  const old=active;active=null;
  if(history.state?.[field]===old.token){returning=true;try{history.back();}catch{returning=false;available=false;}return;}
 }
 const dialog=opened();
 if(!active&&!returning&&dialog)remember(dialog);
}
window.addEventListener('popstate',()=>{
 if(returning){returning=false;active=null;sync();return;}
 // Browser Back closes the overlay, leaving its current story node untouched.
 if(active){const dialog=active.dialog;active=null;if(dialog.open)dialog.close();}
 // Forward does not reopen an old story against a newer reading position.
 if(history.state?.[field])try{history.replaceState(clean(history.state),'');}catch{available=false;}
});
new MutationObserver(sync).observe(document.body,{subtree:true,attributes:true,attributeFilter:['open']});sync();
})();
