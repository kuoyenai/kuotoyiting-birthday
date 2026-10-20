const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.m4a':'audio/mp4','.mp4':'video/mp4','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+(new URL(req.url,'http://localhost').pathname==='/'?'/index.html':decodeURIComponent(new URL(req.url,'http://localhost').pathname)));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 const size=fs.statSync(file).size,range=/bytes=(\d+)-(\d*)/.exec(req.headers.range||''),start=range?Number(range[1]):0,end=range&&range[2]?Math.min(Number(range[2]),size-1):size-1;
 if(start>=size){res.writeHead(416);res.end();return;}
 res.writeHead(range?206:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Content-Length':end-start+1,...(range?{'Content-Range':`bytes ${start}-${end}/${size}`}:{})});fs.createReadStream(file,{start,end}).pipe(res);
});
const endpoint='https://formsubmit.co/ajax/kuoyen.ai@gmail.com';
const vm=require('vm'),story={window:{}};vm.createContext(story);for(const file of ['novel-comic-data.js','novel-extra-shots.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),story);
const chapterCounts=story.window.NOVEL_PANELS.map((rows,i)=>rows.length+story.window.YITING_EXTRA_SHOTS.filter(s=>s.chapter===i).length),wishIndex=chapterCounts.slice(0,7).reduce((a,b)=>a+b,0);
async function view(page,name){
 if(name==='explore')await page.addInitScript(index=>localStorage.setItem('yiting-explore-story-v1',JSON.stringify({mapVersion:2,index,unlocked:95,x:280+index*400-40})),wishIndex);
 await page.goto(base+({gift:'gift.html#wish',game:'game.html#page-6',movie:'movie.html?chapter=0',explore:'explore.html'}[name]));
 if(['gift','game'].includes(name)){
  await page.frameLocator('#birthdayContent').locator('#shareWish').waitFor({state:'attached'});
  const content=page.frames().find(f=>f.parentFrame()&&f.url().includes(name+'.html'));
  await content.waitForFunction(()=>document.readyState==='complete');return content;
 }
 await page.locator('#shareWish').waitFor({state:'attached'});
 if(name==='movie')await page.locator('#egg').click();
 if(name==='explore'){await page.locator('#loading').waitFor({state:'hidden'});await page.locator('#openBirthdayWish').click();}
 return page;
}
let base;
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));base=`http://127.0.0.1:${server.address().port}/`;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});const results=[];
 try{
  for(const {width,height} of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:820,height:1180},{width:1280,height:844}])for(const name of ['gift','movie','game','explore']){
   console.log('CHECK '+(process.env.YITING_TEST_ENGINE||'chromium')+' '+width+'x'+height+' '+name);
   const page=await browser.newPage({viewport:{width,height},serviceWorkers:'block'}),errors=[],sent=[];page.on('pageerror',e=>errors.push(e.message));
   let mode='success',release;
   await page.route(endpoint,async route=>{
    if(route.request().method()==='OPTIONS'){await route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'POST','access-control-allow-headers':'content-type,accept'}});return;}
    sent.push(route.request().postDataJSON());
    if(mode==='network'){await route.abort('failed');return;}
    if(mode==='hold')await new Promise(r=>release=r);
    const json=mode==='activation'?{success:'false',message:'This form needs Activation.'}:mode==='rejected'?{success:'false',message:'Rejected'}:{success:'true',message:'Form submitted successfully'};
    await route.fulfill({status:mode==='rejected'?429:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(json)});
   });
   const frame=await view(page,name),input=frame.locator(name==='explore'?'#birthdayWishInput':'#wish'),save=frame.locator(name==='explore'?'#blowBirthdayCandle':'#saveWish'),status=frame.locator(name==='explore'?'#wishShareStatus':'#wishStatus');
   async function fillWish(text){await input.click();await input.fill(text);assert.strictEqual(await input.inputValue(),text,'Typed draft remains visible');}
   assert(await frame.locator('#shareWish').isDisabled(),'Empty wish cannot share');
   const secret='僅限本機的測試願望';await fillWish(secret);await page.waitForTimeout(100);assert.strictEqual(sent.length,0,'Typing never transmits');
   await save.click();
   await status.filter({hasText:'沒有上傳或寄送'}).waitFor();
   assert.strictEqual(sent.length,0,'Private choice never transmits');
   const key=name==='game'?'yiting-comic-wish-v1':'yiting-birthday-wish';assert.strictEqual(await frame.evaluate(key=>localStorage.getItem(key),key),secret);
   assert((await status.textContent()).includes('沒有上傳或寄送'));
   if(name!=='explore'){await fillWish('修改後仍只留在心裡');await save.click();assert.strictEqual(await frame.evaluate(key=>localStorage.getItem(key),key),'修改後仍只留在心裡');assert.strictEqual(sent.length,0);}
   const text='自願分享的測試願望 <img src=x onerror=alert(1)> 🌠';await fillWish(text);await frame.locator('#shareWish').click();
   assert.strictEqual(await frame.locator('#wishSharePreview').textContent(),text);assert.strictEqual(await frame.locator('#wishSharePreview img').count(),0,'Wish preview is plain text');
   assert((await frame.locator('.wish-share-recipient').textContent()).includes('kuoyen.ai@gmail.com'));
   assert((await frame.locator('#wishShareDisclosure').textContent()).includes('FormSubmit'));
   await page.keyboard.press('Enter');assert.strictEqual(sent.length,0,'Opening confirmation does not focus the send action');
   await frame.locator('#cancelWishShare').click();assert.strictEqual(sent.length,0,'Cancelling never transmits');
   await frame.locator('#shareWish').click();mode='hold';await frame.locator('#confirmWishShare').click();const deadline=Date.now()+5000;while(!release&&Date.now()<deadline)await page.waitForTimeout(10);assert(release,'The request reached the mocked service');
   assert(await frame.locator('#confirmWishShare').isDisabled());assert(await input.evaluate(el=>el.readOnly));assert.strictEqual(sent.length,1);release();
   await frame.locator('#wishSendStatus').filter({hasText:'願望已送交寄信服務'}).waitFor();assert.strictEqual(sent[0].message,text);assert(sent[0].consent.includes('確認寄出願望'));assert(!Object.keys(sent[0]).some(k=>['email','_cc','_replyto'].includes(k)));
   await frame.locator('#cancelWishShare').click();assert(await frame.locator('#shareWish').isDisabled(),'Same accepted wish is not resent');
   for(const fail of ['activation','rejected','network']){
    mode=fail;await fillWish('錯誤保留測試 '+fail);await frame.locator('#shareWish').click();assert.strictEqual(await frame.locator('#confirmWishShare').textContent(),'確認寄出願望');await frame.locator('#confirmWishShare').click();
    await frame.locator('#wishSendStatus').filter({hasText:fail==='activation'?'等待收件人啟用':'無法確認寄送結果'}).waitFor();assert.strictEqual(await input.inputValue(),'錯誤保留測試 '+fail);assert(!await frame.locator('#confirmWishShare').isDisabled());await frame.locator('#cancelWishShare').click();
   }
   const beforeOffline=sent.length;await fillWish('離線保留測試');await frame.locator('#shareWish').click();await page.context().setOffline(true);await frame.locator('#confirmWishShare').click();await frame.locator('#wishSendStatus').filter({hasText:'沒有網路'}).waitFor();assert.strictEqual(sent.length,beforeOffline);await page.context().setOffline(false);
   const rect=await frame.locator('#confirmWishShare').boundingBox();assert(rect.height>=44);const dimensions=await frame.locator('#wishShareConfirm').evaluate(el=>({w:el.getBoundingClientRect().width,viewport:innerWidth,scroll:el.scrollWidth,client:el.clientWidth}));assert(dimensions.w<=dimensions.viewport&&dimensions.scroll<=dimensions.client+1,'Dialog fits viewport');
   const x=name==='explore'?await frame.locator('#world').getAttribute('data-player-x'):null;
   await page.keyboard.press('Escape');await frame.locator('#wishShareConfirm').waitFor({state:'hidden'});
   if(name==='explore'){assert(await frame.locator('#birthdayWishDialog').evaluate(el=>el.open),'Escape closes only sharing overlay');assert.strictEqual(await frame.locator('#world').getAttribute('data-player-x'),x);}
   if(name==='movie')assert(await frame.locator('#birthday').evaluate(el=>el.open),'Escape retains the movie gift');
   await frame.locator('#shareWish').click();await frame.waitForFunction(()=>history.state?.yitingExploreDialog||history.state?.yitingOverlay);await frame.evaluate(()=>history.back());await frame.locator('#wishShareConfirm').waitFor({state:'hidden'});assert.strictEqual(await input.inputValue(),'離線保留測試','Back preserves the unsent draft');
   if(name==='explore')assert(await frame.locator('#birthdayWishDialog').evaluate(el=>el.open));
   if(name==='movie')assert(await frame.locator('#birthday').evaluate(el=>el.open));
   if(name==='gift'){
    await fillWish('希望新的一歲，能平安快樂，也有更多和好朋友一起留下的回憶。🌠');await frame.locator('#shareWish').click();
    await page.screenshot({path:path.resolve(root,`../material-review/wish-share-${width}.png`),fullPage:false});
   }
   assert.deepStrictEqual(errors,[]);results.push({engine:process.env.YITING_TEST_ENGINE||'chromium',width,height,page:name,passed:true});await page.close();
  }
  console.log(JSON.stringify({mockedService:true,realEmailSent:false,results},null,2));
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
