'use strict';
// The owner-facing diagnostics are tested with every mail request intercepted.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),endpoint='https://formsubmit.co/ajax/kuoyen.ai@gmail.com';
const server=http.createServer((req,res)=>{
 const pathname=new URL(req.url,'http://localhost').pathname;
 const file=path.resolve(root,'.'+decodeURIComponent(pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 res.writeHead(200,{'Content-Type':path.extname(file)==='.js'?'text/javascript':'text/html'});fs.createReadStream(file).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base='http://127.0.0.1:'+server.address().port;
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 let count=0;
 try{
  for(const kind of ['gate','skip','letter'])for(const mode of ['accepted','false','activation','network']){
   const page=await browser.newPage({serviceWorkers:'block',viewport:{width:390,height:844}}),sent=[],errors=[];
   page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{
    localStorage.setItem('yiting-birthday-wish','PRIVATE_WISH_MUST_STAY_LOCAL');
    localStorage.setItem('yiting-birthday-letter-2026','PRIVATE_LETTER_MUST_STAY_LOCAL');
   });
   await page.route('**/*',async route=>{
    const r=route.request();
    if(r.url().startsWith(base+'/')){await route.continue();return;}
    if(r.url()!==endpoint){await route.abort('blockedbyclient');return;}
    const headers={'access-control-allow-origin':base,'access-control-allow-headers':'content-type','access-control-allow-methods':'POST, OPTIONS'};
    if(r.method()==='OPTIONS'){await route.fulfill({status:204,headers});return;}
    sent.push(r.postDataJSON());
    if(mode==='network'){await route.abort('failed');return;}
    await route.fulfill({status:200,headers,contentType:'application/json',body:JSON.stringify({success:mode==='false'?'false':'true',message:mode==='activation'?'This form needs activation':'The form was submitted successfully.'})});
   });
   await page.goto(base+'/tests/entry-notify-owner.html?case='+kind);
   await page.waitForFunction(()=>document.getElementById('status').textContent.includes('正式寄信程式已載入'));
   assert.equal(sent.length,0,'loading never sends');
   const button=page.locator(kind==='letter'?'#shareLetter':kind==='gate'?'#introStart':'#introSkip');
   await button.click();await page.waitForFunction(()=>JSON.parse(document.getElementById('result').textContent).result);
   const result=JSON.parse(await page.locator('#result').textContent());
   assert.equal(sent.length,1);assert.equal(result.browserPostAttempts,1);assert.equal(result.moduleLoaded,true);
   assert.equal(result.providerAccepted,mode==='accepted');
   assert.equal(result.result,mode==='accepted'?'provider_accepted':mode==='false'?'not_accepted':mode==='activation'?'activation_required':'network_or_cors_failure');
   assert.equal(result.inboxDeliveryConfirmed,false);
   assert.doesNotMatch(JSON.stringify(sent),/PRIVATE_WISH|PRIVATE_LETTER/);
   if(kind==='letter')assert.match(sent[0].message,/網站擁有者合成驗收/);
   else assert.equal(sent[0].entry,kind==='gate'?'開啟星光之門':'略過開場');
   await page.waitForFunction(selector=>document.querySelector(selector).disabled,kind==='letter'?'#shareLetter':kind==='gate'?'#introStart':'#introSkip');
   await button.dispatchEvent('click');await page.waitForTimeout(30);assert.equal(sent.length,1,'no repeated submission');
   assert.deepEqual(errors,[]);count++;await page.close();
  }
  const page=await browser.newPage({serviceWorkers:'block'});let sent=0;
  await page.route('https://formsubmit.co/**',route=>{sent++;return route.abort('blockedbyclient');});
  await page.goto(base+'/tests/entry-notify-owner.html');assert.equal(sent,0);
  assert.equal(await page.locator('nav a[target="_blank"][rel="noopener noreferrer"]').count(),3);await page.close();
  console.log('PASS '+count+' manual diagnostics cases plus menu; all email mocked, no real email sent');
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
