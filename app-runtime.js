(()=>{
 // One history entry per native dialog lets Back close a viewer first.
 const stack=[];let fromBack=false,consumeClosePop=false;
 const observe=dialog=>{
  const observer=new MutationObserver(()=>{
   if(dialog.open&&!stack.includes(dialog)){stack.push(dialog);history.pushState({...history.state,yitingOverlay:stack.length},'');}
   if(!dialog.open&&stack.includes(dialog)){const wasTop=stack.at(-1)===dialog;stack.splice(stack.indexOf(dialog),1);if(wasTop&&!fromBack&&history.state?.yitingOverlay){consumeClosePop=true;history.back();}}
  });observer.observe(dialog,{attributes:true,attributeFilter:['open']});
 };
 document.querySelectorAll('dialog').forEach(observe);
 new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType!==1)return;if(node.matches('dialog'))observe(node);node.querySelectorAll('dialog').forEach(observe);}))).observe(document.body,{childList:true,subtree:true});
 window.addEventListener('popstate',()=>{if(consumeClosePop){consumeClosePop=false;return;}const dialog=stack.at(-1);if(!dialog)return;fromBack=true;stack.pop();dialog.close();queueMicrotask(()=>fromBack=false);});
 // Ignore expected browser media-policy rejections, but retain diagnostics for real failures.
 const expectedMediaError=reason=>{
  const name=String(reason?.name||'');
  const message=String(reason?.message||reason||'');
  return ['AbortError','NotAllowedError','NotSupportedError'].includes(name)&&/play|media|audio|video|interrupt|user|gesture|supported|request/i.test(message)
   ||name==='AbortError'&&/play\(\)|play request|new load request/i.test(message);
 };
 const failures=[];
 const record=(kind,error)=>{
  const entry={kind,name:String(error?.name||'Error'),message:String(error?.message||error||'未知錯誤').slice(0,280),time:new Date().toISOString(),page:location.pathname};
  failures.push(entry);
  try{sessionStorage.setItem('yiting-runtime-errors',JSON.stringify(failures.slice(-15)));}catch{}
  console.error('[YiTing runtime]',kind,error);
  return entry;
 };
 const showFailure=entry=>{
  let bar=document.getElementById('appFailure');
  if(bar)return;
  bar=document.createElement('aside');bar.id='appFailure';bar.className='app-failure';bar.setAttribute('role','alert');
  const label=document.createElement('span');label.textContent='偵測到程式錯誤，部分互動可能受到影響。';
  const details=document.createElement('details');const summary=document.createElement('summary');summary.textContent='查看錯誤原因';
  const diagnostic=document.createElement('small');diagnostic.textContent=entry.name+'：'+entry.message;
  details.append(summary,diagnostic);
  const reload=document.createElement('button');reload.type='button';reload.textContent='重新整理';reload.onclick=()=>location.reload();
  const dismiss=document.createElement('button');dismiss.type='button';dismiss.textContent='關閉提示';dismiss.onclick=()=>bar.remove();
  bar.append(label,details,reload,dismiss);document.body.append(bar);
 };
 window.addEventListener('error',event=>{
  if(!event.error)return;
  const entry=record('script',event.error);
  showFailure(entry);
 });
 window.addEventListener('unhandledrejection',event=>{
  if(expectedMediaError(event.reason)){event.preventDefault();return;}
  const entry=record('promise',event.reason);
  showFailure(entry);
 });
})();
