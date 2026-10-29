'use strict';
// Reads the actual public sites. Every notification request is intercepted.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const endpoint='https://kuotoyiting-birthday.vercel.app/api/entry-notify';
const output=path.resolve(__dirname,'../../material-review');
(async()=>{
 const proxy=process.env.HTTPS_PROXY||process.env.HTTP_PROXY;
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),...(proxy?{proxy:{server:proxy}}:{})});
 const results=[];fs.mkdirSync(output,{recursive:true});
 try{
  for(const item of [
   {name:'vercel',url:'https://kuotoyiting-birthday.vercel.app/',viewport:{width:390,height:844},button:'introStart',entry:'gate'},
   {name:'pages',url:'https://kuoyenai.github.io/kuotoyiting-birthday/',viewport:{width:844,height:390},button:'introSkip',entry:'skip'}
  ]){
   const page=await browser.newPage({viewport:item.viewport,serviceWorkers:'block'}),sent=[],errors=[];let release;
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>localStorage.setItem('yiting-music-preferences',JSON.stringify({index:0,paused:true})));
   await page.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    // This branch must precede same-origin GET handling so a valid POST cannot escape.
    if(url.href===endpoint){
     const origin=request.headers().origin||new URL(item.url).origin;
     const headers={'access-control-allow-origin':origin,'access-control-allow-methods':'POST, OPTIONS','access-control-allow-headers':'content-type'};
     if(request.method()==='OPTIONS'){await route.fulfill({status:204,headers});return;}
     sent.push({payload:request.postDataJSON(),headers:request.headers()});
     await new Promise(resolve=>{release=resolve;});
     await route.fulfill({status:202,headers,contentType:'application/json',body:'{"accepted":true}'});return;
    }
    if(url.hostname==='formsubmit.co'||!['GET','HEAD'].includes(request.method())||request.resourceType()==='media'){
     await route.abort('blockedbyclient');return;
    }
    await route.continue();
   });
   await page.goto(item.url+'index.html',{waitUntil:'load'});
   await page.frameLocator('#birthdayContent').locator('#introStart').waitFor();
   const frame=page.frames().find(f=>f.parentFrame()&&new URL(f.url()).pathname.endsWith('/index.html'));
   await frame.waitForFunction(()=>document.readyState==='complete'&&document.fonts.status==='loaded');
   assert.equal(sent.length,0);const note=frame.locator('#cinemaIntro .intro-privacy'),box=await note.boundingBox();
   assert.ok(await note.isVisible());assert.ok(box.height>=44);assert.ok(box.y+box.height>=item.viewport.height-24&&box.y+box.height<=item.viewport.height+1);
   assert.ok(Number.parseFloat(await note.evaluate(el=>getComputedStyle(el).fontSize))<=11);
   assert.equal((await note.textContent()).trim(),'隱私與非官方聲明');
   const button=frame.locator('#'+item.button),buttonBox=await button.boundingBox(),panel=await frame.locator('#cinemaIntro .intro-panel').boundingBox();
   assert.ok(buttonBox.y>=panel.y-1&&buttonBox.y+buttonBox.height<=panel.y+panel.height+1);
   await page.screenshot({path:path.join(output,'live-entry-'+item.name+'.png')});
   await button.click();await frame.locator('#cinemaIntro').waitFor({state:'detached',timeout:12000});
   assert.equal(sent.length,1);assert.deepEqual(sent[0].payload,{entry:item.entry});assert.equal(sent[0].headers.referer,undefined);
   assert.doesNotMatch(await frame.locator('body').innerText(),/正在寄信|已通知|寄送成功|kuoyen\.ai@gmail\.com/);
   assert.ok(release,'the intercepted response was held until the opening finished');release();await page.waitForTimeout(100);
   await page.goto(item.url+'privacy.html');assert.equal(await page.locator('html').getAttribute('lang'),'en');
   const text=await page.locator('body').innerText();assert.doesNotMatch(text,/[\u3400-\u9fff]/);assert.match(text,/email the website creator/);assert.match(text,/unofficial, non-commercial/);
   assert.equal(sent.length,1);assert.deepEqual(errors,[]);
   results.push({site:item.url,viewport:item.viewport,entry:item.entry,passed:true,requestIntercepted:true,realEmailSent:false});await page.close();
  }
  fs.writeFileSync(path.join(output,'entry-notify-live-results.json'),JSON.stringify({passed:true,realEmailSent:false,results},null,2)+'\n');
  console.log('PASS two production-site UI checks; valid notification requests intercepted, no real email sent');
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
