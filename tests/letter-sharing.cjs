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
const endpoint='https://formsubmit.co/ajax/kuoyen.ai@gmail.com',letterKey='yiting-birthday-letter-2026',seedReply='之前收藏的回信，請留在這台裝置。',seedWish='舊願望，不應自動寄出。';
const viewports=[{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:820,height:1180},{width:1280,height:844}],engine=process.env.YITING_TEST_ENGINE||'chromium';
async function downloadText(page,button,filename){
 const ready=page.waitForEvent('download');await button.click();const download=await ready;assert.strictEqual(download.suggestedFilename(),filename);assert.strictEqual(await download.failure(),null);
 const stream=await download.createReadStream();assert(stream,'Download has readable contents');const chunks=[];for await(const chunk of stream)chunks.push(chunk);return Buffer.concat(chunks).toString('utf8');
}
async function touchTarget(locator,label){const rect=await locator.boundingBox();assert(rect&&rect.height>=44&&rect.width>=44,label+' has a 44px touch target');}
async function fits(frame,selector,label){const size=await frame.locator(selector).evaluate(el=>({width:el.getBoundingClientRect().width,viewport:innerWidth,scroll:el.scrollWidth,client:el.clientWidth}));assert(size.width<=size.viewport+1&&size.scroll<=size.client+1,label+' fits without horizontal overflow: '+JSON.stringify(size));}
async function screenshot(page,frame,name,viewport,kind){
 const target=kind==='controls'?'#birthdayLetterReply':'#letterSendStatus';await frame.locator(target).evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
 const directory=path.resolve(root,'../material-review');fs.mkdirSync(directory,{recursive:true});await page.screenshot({path:path.join(directory,'letter-direct-'+kind+'-'+engine+'-'+name+'-'+viewport.width+'.png'),fullPage:false});
}
let base;
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));base=`http://127.0.0.1:${server.address().port}/`;
 const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH}),results=[];
 try{
  for(const viewport of viewports)for(const name of ['gift','starlight']){
   console.log('CHECK '+engine+' '+viewport.width+'x'+viewport.height+' '+name+' direct letter');
   const page=await browser.newPage({viewport,serviceWorkers:'block',acceptDownloads:true,reducedMotion:'reduce'}),errors=[],sent=[];page.on('pageerror',error=>errors.push(error.message));let mode='success',release=null;
   // All FormSubmit requests are intercepted; no real email can be sent by this test.
   await page.route('https://formsubmit.co/**',async route=>{
    assert.strictEqual(route.request().url(),endpoint,'Only the configured recipient endpoint is used');
    if(route.request().method()==='OPTIONS'){await route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-methods':'POST','access-control-allow-headers':'content-type,accept'}});return;}
    assert.strictEqual(route.request().method(),'POST');const requestMode=mode;sent.push(route.request().postDataJSON());
    if(requestMode==='network'){await route.abort('failed');return;}if(requestMode==='hold')await new Promise(resolve=>release=resolve);
    const json=requestMode==='activation'?{success:'false',message:'This form needs Activation.'}:requestMode==='rejected'?{success:'false',message:'Rejected'}:{success:'true',message:'Form submitted successfully'};
    await route.fulfill({status:requestMode==='rejected'?429:200,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(json)});
   });
   await page.addInitScript(({key,reply,wish,collected})=>{localStorage.setItem(key,JSON.stringify({collected,reply,date:'2026-10-20'}));localStorage.setItem('yiting-birthday-wish',wish);},{key:letterKey,reply:seedReply,wish:seedWish,collected:name==='gift'});
   await page.goto(base+name+'.html');await page.frameLocator('#birthdayContent').locator('#shareLetter').waitFor({state:'attached'});
   const frame=page.frames().find(candidate=>candidate.parentFrame()&&new URL(candidate.url()).pathname.endsWith('/'+name+'.html'));assert(frame,'Requested page is inside the music shell iframe');await frame.waitForFunction(()=>document.readyState==='complete');
   const box=frame.locator('.birthday-letter'),input=frame.locator('#birthdayLetterReply'),save=box.locator('.letter-save'),share=frame.locator('#shareLetter'),status=box.locator('.letter-status'),sendStatus=frame.locator('#letterSendStatus'),note=box.locator('.wish-share-note');
   assert.strictEqual(await frame.locator('#letterShareConfirm,#wishShareConfirm').count(),0,'Direct sharing creates no confirmation dialogs');assert.strictEqual(await share.getAttribute('aria-haspopup'),null,'Direct share is not advertised as a dialog');
   assert.strictEqual(await input.inputValue(),seedReply,'Stored reply restores as an editable draft');assert.strictEqual(await save.getAttribute('aria-pressed'),String(name==='gift'));assert.strictEqual(await save.textContent(),name==='gift'?'♥ 已收藏 · 更新回信':'♡ 收藏生日信');assert.strictEqual(sent.length,0,'Restoring saved replies and wishes never transmits');
   const duplicateIds=await frame.evaluate(()=>{const ids=[...document.querySelectorAll('[id]')].map(el=>el.id);return ids.filter((id,index)=>ids.indexOf(id)!==index);});assert.deepStrictEqual(duplicateIds,[],'Sharing controls have unique IDs');
   if(name==='starlight'){
    assert.strictEqual(await frame.locator('#shareWish').count(),0,'Letter works independently without wish controls');assert(await frame.locator('#finale').isDisabled());for(let i=0;i<5;i++)await frame.locator('[data-star="'+i+'"]').click();assert(!await frame.locator('#finale').isDisabled());await frame.locator('#finale').click();await frame.locator('#secret').waitFor({state:'visible'});
   }else assert.strictEqual(await frame.locator('#wish').inputValue(),seedWish,'Wish restores independently');
   await box.locator(':scope > button.letter-open').click();await input.waitFor({state:'visible'});await note.waitFor({state:'visible'});
   const disclosure=await note.textContent();assert(disclosure.includes('kuoyen.ai@gmail.com')&&disclosure.includes('FormSubmit'),'Inline disclosure identifies recipient and email service');assert(/直接寄|立即寄|即會寄|就會寄|將.*寄出/.test(disclosure),'Inline disclosure explains immediate sending');
   assert(await note.evaluate(el=>!!(el.compareDocumentPosition(el.parentElement.querySelector('.wish-choices[data-share-kind="letter"]'))&Node.DOCUMENT_POSITION_FOLLOWING)),'Disclosure appears before sharing buttons');
   assert.strictEqual(await sendStatus.evaluate(el=>el.tagName),'SMALL','Dedicated send status stays out of paragraph text exports');
   async function fillReply(value){await input.click();await input.fill(value);assert.strictEqual(await input.inputValue(),value);}
   async function unlocked(){return input.evaluate(el=>!el.disabled&&!el.readOnly);}
   const initialLabel=await save.textContent(),initialPressed=await save.getAttribute('aria-pressed');await fillReply('');assert(await share.isDisabled(),'Empty replies cannot share');assert.strictEqual(await save.textContent(),initialLabel);assert.strictEqual(await save.getAttribute('aria-pressed'),initialPressed);
   const privateDraft='下一年也要快樂 <3 & 🌠';await fillReply(privateDraft);await save.click();await status.filter({hasText:'已收藏在這台裝置'}).waitFor();
   assert.deepStrictEqual(await frame.evaluate(key=>JSON.parse(localStorage.getItem(key)),letterKey),{collected:true,reply:privateDraft,date:'2026-10-20'});assert.strictEqual(await save.textContent(),'♥ 已收藏 · 更新回信');assert.strictEqual(await save.getAttribute('aria-pressed'),'true');assert.strictEqual(sent.length,0,'Private collection never transmits');
   const exported=await downloadText(page,box.locator('.letter-export'),'YiTing-2026-生日紀念信.txt');assert(exported.includes(privateDraft),'Text download contains exact reply');for(const forbidden of [disclosure,'FormSubmit','kuoyen.ai@gmail.com'])assert(!exported.includes(forbidden),'Text download excludes sharing disclosure');
   const postcard=await downloadText(page,box.locator('.letter-postcard'),'YiTing-2026-紅星紀念卡.svg');const postcardText=await frame.evaluate(svg=>{const document=new DOMParser().parseFromString(svg,'image/svg+xml');if(document.querySelector('parsererror'))throw Error('Invalid postcard SVG');return [...document.querySelectorAll('text')].map(el=>el.textContent).join('');},postcard);assert(postcardText.includes(privateDraft),'SVG download preserves and escapes reply');assert.strictEqual(sent.length,0,'Downloads never transmit');
   assert.strictEqual(await save.textContent(),'♥ 已收藏 · 更新回信');assert.strictEqual(await save.getAttribute('aria-pressed'),'true');await fits(frame,'.birthday-letter','Birthday letter');const pageWidth=await frame.evaluate(()=>({scroll:document.documentElement.scrollWidth,width:innerWidth}));assert(pageWidth.scroll<=pageWidth.width+1,'Page has no horizontal overflow');
   for(const [locator,label]of [[save,'Private collect'],[share,'Share reply'],[box.locator('.letter-export'),'Text download'],[box.locator('.letter-postcard'),'Postcard download']])await touchTarget(locator,label);
   const shared='  未來的我，願妳平安快樂，也能勇敢走向喜歡的生活。🌠  ';await fillReply(shared);assert.strictEqual(await save.textContent(),'♥ 已收藏 · 更新回信');assert.strictEqual(sent.length,0,'Typing never sends');if(viewport.width===390)await screenshot(page,frame,name,viewport,'controls');
   mode='hold';await share.click();const deadline=Date.now()+5000;while(!release&&Date.now()<deadline)await page.waitForTimeout(10);assert(release,'One share click reaches only the mocked service');assert.strictEqual(sent.length,1);assert(await share.isDisabled());assert(await save.isDisabled());assert(await input.evaluate(el=>el.readOnly||el.disabled));await share.dispatchEvent('click');assert.strictEqual(sent.length,1,'Pending share ignores duplicate clicks');release();await sendStatus.filter({hasText:'這段話已送交寄信服務'}).waitFor();
   const payload=sent[0];assert.strictEqual(payload.message,shared.trim(),'One click sends only the current trimmed reply');assert.strictEqual(payload.name,'YiTing 留給未來自己的話');assert.strictEqual(payload._subject,'YiTing｜她願意分享的未來回信');assert.strictEqual(payload.source,'生日信 · 留給未來自己的話');assert(payload.consent.includes('分享給Kuo'));assert(!Object.keys(payload).some(key=>['email','_cc','_replyto'].includes(key)));assert(!JSON.stringify(payload).includes(seedReply)&&!JSON.stringify(payload).includes(seedWish),'Stored private material is excluded');
   assert.strictEqual((await frame.evaluate(key=>JSON.parse(localStorage.getItem(key)),letterKey)).reply,privateDraft,'Sharing does not replace privately collected reply');assert(await share.isDisabled(),'Accepted unchanged reply cannot resend');await share.dispatchEvent('click');assert.strictEqual(sent.length,1);assert(!await save.isDisabled());assert(await unlocked());assert.strictEqual(await save.textContent(),'♥ 已收藏 · 更新回信');assert.strictEqual(await save.getAttribute('aria-pressed'),'true');if(viewport.width===320)await screenshot(page,frame,name,viewport,'status');
   for(const failure of ['activation','rejected','network']){
    mode=failure;const draft='失敗仍保留的未來回信 '+failure;await fillReply(draft);const before=sent.length;await share.click();await sendStatus.filter({hasText:failure==='activation'?'等待收件人啟用':'無法確認寄送結果'}).waitFor();assert.strictEqual(sent.length,before+1);assert.strictEqual(await input.inputValue(),draft);assert(!await share.isDisabled());assert(await unlocked());assert(!await save.isDisabled());
   }
   const beforeOffline=sent.length;await fillReply('離線的話仍留給未來自己');await page.context().setOffline(true);await share.click();await sendStatus.filter({hasText:'沒有網路'}).waitFor();assert.strictEqual(sent.length,beforeOffline,'Offline click cannot transmit');assert.strictEqual(await input.inputValue(),'離線的話仍留給未來自己');assert(!await share.isDisabled());assert(!await save.isDisabled());assert(await unlocked());await page.context().setOffline(false);
   if(name==='gift'){
    assert.strictEqual(await frame.locator('#wish').inputValue(),seedWish,'Letter sharing leaves old wish untouched');await frame.locator('#tab-wish').click();const wish=frame.locator('#wish');await wish.click();await wish.fill('這是獨立選擇分享的生日願望');mode='success';const before=sent.length;await frame.locator('#shareWish').click();await frame.locator('#wishSendStatus').filter({hasText:'願望已送交寄信服務'}).waitFor();assert.strictEqual(sent.length,before+1);assert.strictEqual(sent.at(-1).message,'這是獨立選擇分享的生日願望');assert.strictEqual(sent.at(-1)._subject,'YiTing｜她願意分享的生日願望');assert.strictEqual(sent.at(-1).name,'YiTing 生日願望');assert.strictEqual(sent.at(-1).source,'生日收藏');assert.strictEqual(await input.inputValue(),'離線的話仍留給未來自己','Wish sharing does not change letter draft');
   }
   assert.strictEqual(await frame.locator('#letterShareConfirm,#wishShareConfirm').count(),0,'No sharing dialog is created after sending');assert.deepStrictEqual(errors,[],'No page errors');results.push({engine,...viewport,page:name,passed:true,mockedRequests:sent.length});await page.close();
  }
  console.log(JSON.stringify({directSend:true,mockedService:true,realEmailSent:false,results},null,2));
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error);server.close();process.exitCode=1;});
