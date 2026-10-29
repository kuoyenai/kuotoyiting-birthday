(()=>{
 'use strict';
 const endpoint='https://formsubmit.co/ajax/kuoyen.ai@gmail.com';
 const kind=new URLSearchParams(location.search).get('case');
 if(!['gate','skip','letter'].includes(kind))return;
 const fixture=document.getElementById('fixture'),status=document.getElementById('status'),output=document.getElementById('result');
 const report={case:kind,module:kind==='letter'?'wish-sharing.js':'entry-notify.js',browserPostAttempts:0,providerAccepted:false,inboxDeliveryConfirmed:false};
 const selector=kind==='letter'?'#shareLetter':kind==='gate'?'#introStart':'#introSkip';
 let armed=false,settled=false,timer;
 function show(message){status.textContent=message;output.textContent=JSON.stringify(report,null,2);}
 function lock(){const button=document.querySelector(selector);if(button)button.disabled=true;}
 document.getElementById('copy').disabled=false;
 document.getElementById('copy').onclick=async()=>{
  try{await navigator.clipboard.writeText(output.textContent);}catch{status.textContent='請直接選取下方驗收結果複製。';}
 };
 const originalFetch=window.fetch.bind(window);
 window.fetch=(input,options)=>{
  if(String(input)!==endpoint)return originalFetch(input,options);
  if(!armed||report.browserPostAttempts||options?.method!=='POST')return Promise.reject(new Error('Manual single-attempt test only'));
  armed=false;report.browserPostAttempts=1;report.clickedAtUtc=new Date().toISOString();
  report.clickedAtTaipei=new Intl.DateTimeFormat('zh-TW',{dateStyle:'medium',timeStyle:'medium',timeZone:'Asia/Taipei'}).format(new Date(report.clickedAtUtc));
  show('已提交測試，等待服務回應；尚未確認寄出。');
  timer=setTimeout(()=>{if(!settled){report.result='response_timeout';lock();show('未取得服務回應，投遞結果未知。請先核對收件匣，勿重複寄送。');}},25000);
  let result;
  try{result=originalFetch(input,options);}catch(error){result=Promise.reject(error);}
  result.then(async response=>{
   report.httpStatus=response.status;
   try{
    const data=await response.clone().json();
    report.success=data.success;report.message=String(data.message||'').slice(0,600);
    const activation=/activat|confirm.*email|verify.*email/i.test(report.message);
    report.providerAccepted=response.status===200&&(data.success===true||data.success==='true')&&!activation;
    report.result=activation?'activation_required':report.providerAccepted?'provider_accepted':'not_accepted';
    show(report.providerAccepted?'服務已接受這次測試；請另外確認 Gmail 是否收到。':activation?'服務要求啟用收件端點；這次尚未確認寄出。':'服務沒有接受這次測試；請回報下方結果。');
   }catch{
    report.result='non_json_response';show('服務未回傳可確認寄送的 JSON；請回報下方結果。');
   }
  }).catch(error=>{
   report.result='network_or_cors_failure';report.error=String(error).split('\n')[0];show('連線或跨站請求失敗，尚未確認寄出。請回報下方結果。');
  }).finally(()=>{settled=true;clearTimeout(timer);lock();});
  return result;
 };
 document.addEventListener('click',event=>{
  if(event.isTrusted&&event.target.closest(selector)&&!event.target.closest(selector).disabled&&!report.browserPostAttempts)armed=true;
 },{capture:true});
 if(kind==='letter'){
  fixture.innerHTML='<div class="birthday-letter"><h2>原生日信分享</h2><textarea id="birthdayLetterReply" readonly rows="4" aria-label="固定合成測試內容"></textarea><div class="letter-actions"><button type="button" class="letter-save">收藏合成測試（不寄信）</button></div><p class="letter-status"></p></div>';
  document.getElementById('birthdayLetterReply').value='【網站擁有者合成驗收】生日信原分享流程連線測試，'+new Date().toISOString()+'；不含訪客回信或願望。';
 }else{
  try{if(sessionStorage.getItem('yiting-entry-notify-attempted-v1')==='1'){
   report.result='tab_already_attempted';show('此分頁已有入口通知嘗試。請使用上方連結開啟全新分頁；本頁沒有重寄。');return;
  }}catch{}
  fixture.innerHTML='<div id="cinemaIntro"><h2>入口通知測試</h2><a href="privacy.html">隱私與非官方聲明</a><p><button id="'+(kind==='gate'?'introStart':'introSkip')+'" type="button" disabled>'+(kind==='gate'?'開啟星光之門':'略過開場')+'</button></p></div>';
 }
 const script=document.createElement('script');script.src=report.module+'?v=20261029-80';
 script.onload=()=>{const button=document.querySelector(selector);if(button)button.disabled=false;report.moduleLoaded=true;show('正式寄信程式已載入。手動按下測試按鈕才會提交一次。');};
 script.onerror=()=>{report.result='module_load_failed';show('正式寄信程式載入失敗；沒有寄信。');};
 document.head.append(script);
})();
