(()=>{
const APP_VERSION='20261016-11';
window.yitingReloadApp=()=>{if(window.parent!==window){try{if(parent.yitingPersistent){parent.location.reload();return;}}catch{}}location.reload();};
if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js',{scope:'./',updateViaCache:'none'}).catch(()=>{});
const standalone=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
let installEvent;
window.addEventListener('beforeinstallprompt',event=>{event.preventDefault();installEvent=event;});
const host=document.querySelector('.album-jacket');
{
 const panel=document.createElement('aside');panel.className='app-install';panel.setAttribute('aria-label','加入手機主畫面');
 panel.innerHTML='<img src="assets/icon-192.png?v=20261016-11" alt="YiTing 生日邀請卡 App 圖示" width="64" height="64"><div><h2>把星光，收進手機。</h2><p>加入主畫面，下次輕觸圖示就能回來。</p></div><button type="button" id="installBirthdayApp">加入手機主畫面</button>';
 if(host&&!standalone())host.after(panel);else {panel.hidden=true;document.body.append(panel);}
 const dialog=document.createElement('dialog');dialog.className='install-guide';dialog.setAttribute('aria-labelledby','installGuideTitle');
 dialog.innerHTML='<img class="install-preview" src="assets/icon-192.png?v=20261016-11" alt="YiTing 生日 App 圖示" width="72" height="72"><h2 id="installGuideTitle">把生日邀請留在主畫面</h2><p>iPhone／iPad</p><ol><li>用 Safari 開啟這個網站。</li><li>點選分享按鈕，再選「加入主畫面」。</li><li>若出現「作為網頁 App 打開」，請保持開啟，再點「加入」。</li><li>如果已有舊捷徑，圖示更新可能需要移除舊捷徑後重新加入；網站不會代你刪除</li></ol><p>Android</p><ol><li>用 Chrome 開啟這個網站。</li><li>點選瀏覽器選單，選「安裝應用程式」或「新增至主畫面」。</li><li>依畫面提示確認安裝。</li></ol><p class="install-note">影片、歌曲及尚未載入的插畫需要網路。願望只留在目前使用的瀏覽器／App，換裝置或換開啟方式可能不會共用。</p><button type="button" id="closeInstallGuide">知道了</button>';
 document.body.append(dialog);const tools=document.createElement('footer');tools.className='app-tools';tools.innerHTML='<span>'+ (standalone()?'已從主畫面開啟 · YITING 10.20':'YITING 10.20 · 手機主畫面 App · '+APP_VERSION)+'</span><button type="button" id="appHelp">'+(standalone()?'App 使用說明':'加入主畫面／安裝說明')+'</button><button type="button" id="appRefresh">取得最新版本</button><p id="appUpdateStatus" role="status"></p>';document.body.append(tools);document.getElementById('appHelp').onclick=()=>dialog.showModal();document.getElementById('appRefresh').onclick=async()=>{const status=document.getElementById('appUpdateStatus');if(!navigator.onLine){status.textContent='請連上網路後再更新。';return;}status.textContent='正在檢查最新版本…';try{const registration=await navigator.serviceWorker.getRegistration();if(registration)await registration.update();window.yitingReloadApp();}catch{status.textContent='暫時無法更新，請稍後再試。';}};
 document.getElementById('closeInstallGuide').onclick=()=>dialog.close();
 document.getElementById('installBirthdayApp').onclick=async()=>{const available=installEvent||(window.parent!==window?parent.yitingPersistent?.installEvent:null);if(available){const event=available;installEvent=null;if(window.parent!==window&&parent.yitingPersistent)parent.yitingPersistent.installEvent=null;await event.prompt();const result=await event.userChoice;if(result.outcome==='accepted')panel.hidden=true;}else dialog.showModal();};
 window.addEventListener('appinstalled',()=>{panel.hidden=true;installEvent=null;});
}
const status=document.createElement('p');status.className='offline-status';status.setAttribute('role','status');status.textContent='目前沒有網路，影片、歌曲與新圖片需要連線後開啟。';status.hidden=navigator.onLine;document.body.prepend(status);window.addEventListener('online',()=>status.hidden=true);window.addEventListener('offline',()=>status.hidden=false);
})();




