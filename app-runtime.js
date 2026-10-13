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
 const showFailure=()=>{
  if(document.getElementById('appFailure'))return;
  const bar=document.createElement('aside');bar.id='appFailure';bar.className='app-failure';bar.setAttribute('role','alert');bar.innerHTML='<span>這個頁面的部分功能暫時遇到問題。</span><button type="button">重新整理</button><button type="button">關閉提示</button>';
  bar.querySelectorAll('button')[0].onclick=()=>location.reload();bar.querySelectorAll('button')[1].onclick=()=>bar.remove();document.body.append(bar);
 };
 window.addEventListener('error',event=>{if(event.error)showFailure();});window.addEventListener('unhandledrejection',showFailure);
})();

