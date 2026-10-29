'use strict';
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),endpoint='https://kuotoyiting-birthday.vercel.app/api/entry-notify';
const engineName=process.env.YITING_TEST_ENGINE==='webkit'?'webkit':'chromium';
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.webp':'image/webp','.jpg':'image/jpeg','.ttf':'font/ttf','.m4a':'audio/mp4','.mp4':'video/mp4'};
const server=http.createServer((req,res)=>{
 const url=new URL(req.url,'http://localhost'),file=path.resolve(root,'.'+(url.pathname==='/'?'/index.html':decodeURIComponent(url.pathname)));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
async function content(page){
 await page.frameLocator('#birthdayContent').locator('#homeMusic').waitFor();
 const frame=page.frames().find(f=>f.parentFrame()&&new URL(f.url()).pathname.endsWith('/index.html'));
 assert.ok(frame,'invitation lives in its existing music shell');await frame.waitForFunction(()=>document.readyState==='complete');return frame;
}
async function cleanInterface(frame){
 assert.doesNotMatch(await frame.locator('body').innerText(),/正在寄信|已通知|寄送成功|正在通知|kuoyen\.ai@gmail\.com/);
}
async function newPage(browser,base,{viewport,mode='hold',reducedMotion='no-preference',blockedStorage=false}={}){
 const page=await browser.newPage({viewport,serviceWorkers:'block',reducedMotion}),sent=[],errors=[];let release;
 page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(({blockedStorage})=>{
  localStorage.setItem('yiting-music-preferences',JSON.stringify({index:2,paused:true}));
  localStorage.setItem('yiting-birthday-wish','PRIVATE_WISH_MUST_STAY_LOCAL');
  localStorage.setItem('yiting-birthday-letter-2026',JSON.stringify({reply:'PRIVATE_LETTER_MUST_STAY_LOCAL'}));
  if(blockedStorage){const originalGet=Storage.prototype.getItem,originalSet=Storage.prototype.setItem;
   Storage.prototype.getItem=function(k){if(this===sessionStorage)throw Error('Blocked session storage');return originalGet.call(this,k);};
   Storage.prototype.setItem=function(k,v){if(this===sessionStorage)throw Error('Blocked session storage');return originalSet.call(this,k,v);};
  }
 },{blockedStorage});
 await page.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(url.origin===new URL(base).origin){await route.continue();return;}
  if(url.href===endpoint){
   const headers={'access-control-allow-origin':new URL(base).origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type'};
   if(request.method()==='OPTIONS'){await route.fulfill({status:204,headers});return;}
   sent.push({payload:request.postDataJSON(),headers:request.headers()});
   if(mode==='network'){await route.abort('failed');return;}
   if(mode==='hold')await new Promise(resolve=>{release=resolve;});
   await route.fulfill({status:mode==='http'?503:202,headers,contentType:'application/json',body:JSON.stringify({accepted:mode!=='http'})});return;
  }
  // External requests, including all real mail services, are never allowed.
  await route.abort('blockedbyclient');
 });
 await page.clock.install();await page.goto(base+'index.html');const frame=await content(page);
 return {page,frame,sent,errors,release:()=>release?.()};
}
async function waitSent(page,sent){for(let n=0;n<100&&!sent.length;n++)await page.waitForTimeout(10);assert.equal(sent.length,1);}
(async()=>{
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
 const base=`http://127.0.0.1:${server.address().port}/`;
 const browser=await playwright[engineName].launch({headless:true,...(engineName==='chromium'&&process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 const results=[];
 try{
  for(const viewport of [{width:320,height:568},{width:390,height:844},{width:568,height:320},{width:844,height:390},{width:820,height:1180},{width:1280,height:844}]){
   for(const [button,entry]of [['introStart','gate'],['introSkip','skip']]){
    const t=await newPage(browser,base,{viewport});const {page,frame,sent,errors}=t;
    assert.equal(sent.length,0,'loading and existing private text cause no notification');await cleanInterface(frame);
    const policy=frame.locator('#cinemaIntro .intro-privacy');assert.ok(await policy.isVisible());assert.ok((await policy.boundingBox()).height>=44);
    const policyBox=await policy.boundingBox();assert.ok(policyBox.y+policyBox.height<=viewport.height+1&&policyBox.y+policyBox.height>=viewport.height-24,'policy stays at the bottom of the opening');
    assert.ok(Number.parseFloat(await policy.evaluate(el=>getComputedStyle(el).fontSize))<=11,'policy text stays small');
    const buttonBox=await frame.locator('#'+button).boundingBox(),panelBox=await frame.locator('#cinemaIntro .intro-panel').boundingBox();
    assert.ok(buttonBox.height>=44);assert.ok(buttonBox.y>=panelBox.y-1&&buttonBox.y+buttonBox.height<=panelBox.y+panelBox.height+1,'entry button is fully visible without scrolling');
    if([390,844].includes(viewport.width)&&button==='introStart'){
     fs.mkdirSync(path.resolve(root,'../material-review'),{recursive:true});
     await page.screenshot({path:path.resolve(root,'../material-review/entry-notify-opening-'+viewport.width+'.png')});
    }
    await frame.locator('#'+button).click();await waitSent(page,sent);
    assert.deepEqual(sent[0].payload,{entry});assert.equal(sent[0].headers.referer,undefined);
    await frame.locator('#'+button).dispatchEvent('click');assert.equal(sent.length,1,'double clicks do not duplicate mail');
    await page.clock.runFor(6500);await frame.locator('#cinemaIntro').waitFor({state:'detached'});
    await cleanInterface(frame);assert.equal(sent.length,1,'the opening finished while the request was still held');
    await frame.locator('#unbox').click();assert.equal(await frame.locator('#unbox').getAttribute('aria-expanded'),'true');
    assert.equal(await frame.locator('.album-item').count(),4,'all four destinations remain');assert.equal(sent.length,1);
    assert.equal(await frame.evaluate(()=>localStorage.getItem('yiting-birthday-wish')),'PRIVATE_WISH_MUST_STAY_LOCAL');
    assert.equal(await frame.evaluate(()=>JSON.parse(localStorage.getItem('yiting-music-preferences')).paused),true);
    t.release();await page.waitForTimeout(40);await cleanInterface(frame);
    await page.goto(base+'index.html');const returned=await content(page);assert.equal(await returned.locator('#cinemaIntro').count(),0);assert.equal(sent.length,1);
    assert.deepEqual(errors,[]);results.push({...viewport,entry,mode:'pending response; no blocking or UI; session dedupe',passed:true});await page.close();
   }
  }
  for(const options of [{mode:'network'},{mode:'http'},{mode:'hold',reducedMotion:'reduce'},{mode:'hold',blockedStorage:true}]){
   const t=await newPage(browser,base,{viewport:{width:390,height:844},...options});
   await t.frame.locator('#introSkip').click();await waitSent(t.page,t.sent);await t.page.clock.runFor(1500);
   await t.frame.locator('#cinemaIntro').waitFor({state:'detached'});await cleanInterface(t.frame);assert.equal(t.sent.length,1);
   t.release();await t.page.waitForTimeout(30);assert.deepEqual(t.errors,[]);results.push({...options,entry:'skip',passed:true});await t.page.close();
  }
  const escape=await newPage(browser,base,{viewport:{width:390,height:844},mode:'success'});
  await escape.frame.locator('#introSkip').focus();await escape.page.keyboard.press('Escape');await escape.page.clock.runFor(1500);await escape.frame.locator('#cinemaIntro').waitFor({state:'detached'});assert.equal(escape.sent.length,0);await escape.page.close();
  for(const viewport of [{width:320,height:568},{width:820,height:1180},{width:1280,height:844}]){
   const t=await newPage(browser,base,{viewport,mode:'success'});await t.frame.locator('#cinemaIntro .intro-privacy').click();await t.page.waitForURL('**/privacy.html');
   assert.equal(t.sent.length,0,'reading the policy never sends');assert.equal(await t.page.locator('html').getAttribute('lang'),'en');
   const text=await t.page.locator('body').innerText();assert.doesNotMatch(text,/[\u3400-\u9fff]/);assert.match(text,/email the website creator/);assert.match(text,/unofficial, non-commercial/);
   assert.ok(await t.page.locator('#entry-notifications').isVisible());
   assert.ok(await t.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'English policy has no horizontal overflow');
   if(viewport.width===320||viewport.width===1280)await t.page.screenshot({path:path.resolve(root,'../material-review/privacy-english-'+viewport.width+'.png'),fullPage:true});
   await t.page.locator('a.return').first().click();const back=await content(t.page);assert.ok(await back.locator('#introStart').isVisible());assert.equal(t.sent.length,0);
   assert.deepEqual(t.errors,[]);results.push({...viewport,mode:'English policy and return; zero mail',passed:true});await t.page.close();
  }
  fs.mkdirSync(path.resolve(root,'../material-review'),{recursive:true});
  fs.writeFileSync(path.resolve(root,'../material-review/entry-notify-browser-results.json'),JSON.stringify({engine:engineName,realEmailSent:false,results},null,2));
  console.log('PASS '+engineName+' '+results.length+' entry/privacy browser cases; all email requests intercepted');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
