const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const assert = require('node:assert/strict');
// Set NODE_PATH to your installed Playwright packages; no site dependencies.
const { chromium, devices } = require('playwright');
const playerTheme=el=>[el,el.querySelector('h3'),el.querySelector('.audio-track strong'),el.querySelector('.audio-original'),el.querySelector('.audio-elapsed')].map(node=>{const s=getComputedStyle(node);return {font:s.fontFamily,size:s.fontSize,weight:s.fontWeight,spacing:s.letterSpacing,color:s.color,scheme:s.colorScheme};});
const root = path.resolve(__dirname, '..');
const mime = {'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.m4a':'audio/mp4','.mp4':'video/mp4'};
const server = http.createServer((req,res)=>{
  const name = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
  const file = path.resolve(root, '.'+(name==='/'?'/index.html':name));
  if(!file.startsWith(root+path.sep)||!fs.existsSync(file)){res.writeHead(404);res.end();return;}
  const size=fs.statSync(file).size;const range=/bytes=(\d+)-(\d*)/.exec(req.headers.range||'');
  const start=range?Number(range[1]):0,end=range&&range[2]?Math.min(Number(range[2]),size-1):size-1;
  res.writeHead(range?206:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Content-Length':end-start+1,...(range?{'Content-Range':`bytes ${start}-${end}/${size}`}:{})});
  fs.createReadStream(file,{start,end}).pipe(res);
});
(async()=>{
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}/`;
 const browser=await chromium.launch({channel:process.env.BROWSER_CHANNEL||'chrome',headless:true});
 const extrasOnly=process.argv.includes('--extras'),visualOnly=process.argv.includes('--visual');
 const results=extrasOnly?JSON.parse(fs.readFileSync(path.join(root,'tests','smoke-results.json'),'utf8')).filter(result=>!result.test?.startsWith('reduced motion intro')):[];const baseline=process.argv.includes('--baseline');
 fs.mkdirSync(path.join(root,'tests','screenshots'),{recursive:true});
 try {
 for(const [label,options] of (extrasOnly?[]:[['desktop',{viewport:{width:1440,height:1000}}],['iPhone',devices['iPhone 13']],['Android',devices['Pixel 7']],['small',{viewport:{width:360,height:780},isMobile:true,hasTouch:true}]])){
  const context=await browser.newContext({...options,serviceWorkers:'block'});
  await context.addInitScript(()=>{sessionStorage.setItem('yiting-intro-seen','1');if(!localStorage.getItem('yiting-music-preferences'))localStorage.setItem('yiting-music-preferences',JSON.stringify({index:0,paused:true}));});
  let commonTheme=null;
  for(const file of ['index.html','movie.html','game.html','novel-comic.html','gift.html','starlight.html','install.html','materials.html']){
   const page=await context.newPage(),errors=[],missing=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)missing.push(r.url());});
   await page.goto(base+file);await page.waitForTimeout(400);
   if(file==='index.html')await page.locator('#unbox').click();
   const overflow=await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+1);
   await page.screenshot({path:path.join(root,'tests','screenshots',`${baseline?'baseline-':visualOnly?'design-':''}${label}-${file}.png`),fullPage:false});
   results.push({label,file,errors,missing,overflow});
   assert.equal(errors.length,0,`${label} ${file} JS errors: ${errors}`);
   assert.equal(missing.length,0,`${label} ${file} missing assets: ${missing}`);
   assert.equal(overflow,false,`${label} ${file} overflow`);
   if(visualOnly&&(file==='novel-comic.html'||file==='game.html')){
    const sheet=file==='novel-comic.html'?'#panels':'#sheet';
    await page.locator(sheet).scrollIntoViewIfNeeded();await page.locator(sheet+' img').evaluateAll(async imgs=>{imgs.forEach(img=>img.loading='eager');await Promise.all(imgs.map(img=>img.decode()));});
    await page.locator(sheet).screenshot({path:path.join(root,'tests','screenshots',`${label}-${file==='novel-comic.html'?'novel':'film'}-spread.png`)});
   }
   if(visualOnly&&['index.html','game.html','novel-comic.html','gift.html','movie.html'].includes(file)){
    if(file==='index.html')await page.locator('.home-soundtrack').evaluate(el=>el.open=true);
    if(file==='game.html')await page.locator('.settings').evaluate(el=>el.open=true);
    if(file==='novel-comic.html')await page.locator('.reader-settings').evaluate(el=>el.open=true);
    if(file==='movie.html')await page.locator('#egg').click();
    const player=page.locator('.album-audio-player').first();assert.equal(await player.getAttribute('data-player-version'),'20261013-8');assert.equal(await player.locator('.audio-track').count(),4);const theme=await player.evaluate(playerTheme);if(!commonTheme)commonTheme=theme;else assert.deepEqual(theme,commonTheme,`${label} ${file} player style mismatch`);
    await player.screenshot({path:path.join(root,'tests','screenshots',`${label}-${file}-unified-player.png`)});
    if(file==='gift.html'){await page.locator('#tab-novel').click();const second=page.locator('#gift-novel .album-audio-player');assert.equal(await second.isVisible(),true);assert.deepEqual(await second.evaluate(playerTheme),commonTheme,`${label} gift novel player style mismatch`);await second.screenshot({path:path.join(root,'tests','screenshots',`${label}-gift-novel-unified-player.png`)});}
   }
   await page.close();
  }
  if(!baseline&&!visualOnly&&label!=='small'){
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   // Each existing player's controls must play all four actual audio assets.
   const players=[['index.html','#homeSong','#homeMusic','#homeMusic'],['game.html','#bgm','#music','#music'],['novel-comic.html','#comicMusic','#musicToggle','#musicToggle'],['gift.html','#song','#listen','#listen'],['movie.html','#song','#listen','#listen']];
   for(const [file,audio,play,pause] of players){
    await page.goto(base+file);
    if(file==='index.html')await page.locator('.home-soundtrack').evaluate(el=>el.open=true);
    if(file==='game.html')await page.locator('.settings').evaluate(el=>el.open=true);
    if(file==='novel-comic.html')await page.locator('.reader-settings').evaluate(el=>el.open=true);
    if(file==='movie.html')await page.locator('#egg').click();
    assert.equal(await page.locator('.album-audio-player').first().getAttribute('data-player-version'),'20261013-8');
    for(let index=0;index<4;index++){
     await page.locator('.album-audio-player').first().locator(`[data-audio-track="${index}"]`).click();
     await page.waitForFunction(sel=>{const a=document.querySelector(sel);return a.readyState>=1&&!a.paused&&a.currentTime>0;},audio);
     const state=await page.evaluate(({audio,index})=>{const a=document.querySelector(audio);return {src:a.src,expected:new URL(YITING_TRACKS[index].src,document.baseURI).href,download:YITING_TRACKS[index].video,duration:a.duration};},{audio,index});
     assert.equal(state.src,state.expected);assert.ok(state.duration>50);
     await page.locator('.album-audio-player .audio-play').first().click();
     assert.equal(await page.locator(audio).evaluate(a=>a.paused),true);
     assert.equal(await page.evaluate(()=>yitingMusicRead().paused),true);
     // Compare the rendered bilingual lyrics against unchanged source rows, at every cue.
     await page.locator(audio).evaluate(a=>a.currentTime=0);
     await page.waitForTimeout(100);
     const rows=await page.evaluate(index=>BIRTHDAY_TIMED_LYRICS[YITING_TRACKS[index].key],index);
     for(const row of rows){
      await page.locator(audio).evaluate((a,t)=>a.currentTime=t+.05,row[0]);
      await page.waitForFunction(({audio,t})=>Math.abs(document.querySelector(audio).currentTime-t)<.2,{audio,t:row[0]+.05});
      await page.waitForTimeout(15);
      const ko='.album-audio-player .audio-original';
      const zh='.album-audio-player .audio-translation';
      await page.waitForFunction(({ko,zh,row})=>document.querySelector(ko)?.textContent===row[2]&&document.querySelector(zh)?.textContent.trim()===row[3].trim(),{ko,zh,row});
     }
     results.push({label,file,test:`track ${index+1} actual play, pause, ${rows.length} bilingual cues`,pass:true});
    }
   }
   // Cross-page progress and pause intent survive navigation.
   await page.goto(base+'gift.html');await page.locator('[data-audio-track="1"]').first().click();
   await page.waitForFunction(()=>document.querySelector('#song').readyState>0&&!document.querySelector('#song').paused);
   await page.locator('.audio-play').first().click();await page.locator('#song').evaluate(a=>a.currentTime=52);
   await page.waitForTimeout(150);await page.goto(base+'novel-comic.html');
   await page.waitForFunction(()=>document.querySelector('#comicMusic').readyState>0);
   await page.locator('.reader-settings').evaluate(el=>el.open=true);
   const restored=await page.locator('#comicMusic').evaluate(a=>({time:a.currentTime,paused:a.paused}));
   assert.ok(Math.abs(restored.time-52)<.5,JSON.stringify(restored));assert.equal(restored.paused,true);
   // Error recovery is visible and keeps the same source and saved progress.
   await page.route('**/only-for-you.m4a',route=>route.abort());
   await page.locator('[data-audio-track="1"]').first().click();
   await page.locator('.audio-retry').first().waitFor({state:'visible'});
   await page.unroute('**/only-for-you.m4a');await page.locator('.audio-retry').first().click();
   await page.waitForFunction(()=>!document.querySelector('#comicMusic').paused&&document.querySelector('#comicMusic').currentTime>=52);
   results.push({label,test:'cross-page progress, pause preference, network failure and retry',pass:true});
   // Five original member stars, unlock, three scenes, response persistence and downloads.
   await page.goto(base+'starlight.html');assert.equal(await page.locator('#finale').isDisabled(),true);
   for(let i=0;i<5;i++)await page.locator(`[data-star="${i}"]`).click();
   await page.locator('#finale').click();assert.equal(await page.locator('.ending-choices').isVisible(),false);await page.locator('.ending-next').click();assert.equal(await page.locator('.ending-choices').isVisible(),true);
   await page.locator('.ending-choices button').nth(1).click();assert.match(await page.locator('.ending-response').textContent(),/安心休息/);
   await page.locator('.ending-next').click();assert.equal(await page.locator('.ending-choices').isVisible(),false);assert.match(await page.locator('.ending-words').textContent(),/2026 年 10 月 20 日/);
   await page.locator('.letter-open').click();await page.locator('#birthdayLetterReply').fill('願明年的自己，也記得好好休息。');await page.locator('.letter-save').click();
   await page.locator('.birthday-letter').screenshot({path:path.join(root,'tests','screenshots',`${label}-letter.png`)});
   await page.locator('.ending-scene').screenshot({path:path.join(root,'tests','screenshots',`${label}-ending.png`)});
   const download=page.waitForEvent('download');await page.locator('.letter-export').click();assert.match((await download).suggestedFilename(),/生日紀念信/);
   const postcard=page.waitForEvent('download');await page.locator('.letter-postcard').click();assert.match((await postcard).suggestedFilename(),/紅星紀念卡/);
   await page.reload();assert.equal(await page.locator('#secret').isVisible(),true);await page.locator('.letter-open').click();assert.equal(await page.locator('#birthdayLetterReply').inputValue(),'願明年的自己，也記得好好休息。');
   await page.goto(base+'gift.html');await page.locator('.letter-open').click();assert.equal(await page.locator('#birthdayLetterReply').inputValue(),'願明年的自己，也記得好好休息。');
   results.push({label,test:'five stars, ending choices, reload, shared letter collection and two downloads',pass:true});
   const style=await page.locator('.album-audio-player').first().evaluate(el=>({scheme:getComputedStyle(el).colorScheme,version:el.dataset.playerVersion}));assert.deepEqual(style,{scheme:'dark',version:'20261013-8'});
   await page.goto(base+'novel-comic.html#chapter-0');
   const expected=await page.evaluate(()=>NOVEL_PANELS.flat().map(row=>({image:row[0],narration:row[1],lines:row[2]}))),seen=[];
   for(let n=0;n<10;n++){
    const state=await page.evaluate(()=>({panels:[...document.querySelectorAll('#panels>.panel')].map(el=>({image:el.querySelector('img').getAttribute('src').replace('assets/','').replace('.webp',''),narration:el.querySelector('.panel-narration').textContent,lines:[...el.querySelectorAll('.bubble')].map(b=>[b.querySelector('strong').textContent,b.querySelector('p').textContent])})),chapter:Number(document.body.dataset.storyChapter),count:NOVEL_PANELS[Number(document.body.dataset.storyChapter)].length,fullText:[...document.querySelectorAll('#originalText>p')].map(p=>p.textContent),source:NOVEL_TEXT[Number(document.body.dataset.storyChapter)].paragraphs,counter:document.querySelector('#pageCount').textContent}));
    assert.equal(state.panels.length,state.count);assert.equal(state.counter,`${n+1} / 10`);assert.deepEqual(state.fullText,state.source);seen.push(...state.panels);
    if(n===0){const first=await page.locator('#story-panel-0').boundingBox(),second=await page.locator('#story-panel-1').boundingBox();assert.ok(second.x>first.x);assert.ok(Math.abs(first.y-second.y)<2);}
    if(n===4)assert.equal(state.panels.length,22);
    for(const button of await page.locator('#panels .star-button').all())await button.click();
    if(n<9){assert.equal(await page.locator('.journey-finish').isVisible(),false);await page.locator('#next').click();}
   }
   assert.deepEqual(seen,expected);assert.equal(await page.locator('#next').isDisabled(),true);assert.equal(await page.locator('.journey-finish').isVisible(),true);
   assert.equal(await page.evaluate(()=>JSON.parse(localStorage.getItem('yiting-novel-comic-stars')).length),5);
   await page.goto(base+'novel-comic.html#chapter-4-panel-18');await page.locator('#story-panel-18').waitFor();assert.equal(await page.locator('#panels>.panel').count(),22);
   await page.locator('#story-panel-18 .art-button').click();assert.equal(await page.locator('#imageViewer').isVisible(),true);await page.locator('#closeViewer').click();
   await page.locator('#next').click();await page.reload();assert.equal(await page.locator('body').getAttribute('data-story-chapter'),'5');
   await page.goto(base+'index.html');assert.match(await page.locator('#continueJourney').getAttribute('href'),/#chapter-5$/);
   await page.goto(base+'novel-comic.html#chapter-4-spread-6');await page.locator('#story-panel-18.story-return-target').waitFor();assert.equal(await page.locator('#panels>.panel').count(),22);
   results.push({label,test:'one dark player component, ten complete comic chapter sheets, all 75 panels and text, paired mobile frames, five collectibles, links, viewer and resume',pass:true});
   assert.equal(errors.length,0,errors.join('\n'));await page.close();
  }
  await context.close();
 }
 if(!baseline&&!visualOnly){
  const context=await browser.newContext({...devices['iPhone 13'],reducedMotion:'reduce',serviceWorkers:'block'});
  const page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'index.html');await page.locator('#introStart').click();await page.locator('#cinemaIntro').waitFor({state:'detached'});
  assert.equal(await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length),0);
  await page.goto(base+'movie.html');await page.waitForFunction(()=>document.querySelector('#film').readyState>0);if(await page.locator('#film').evaluate(a=>a.paused))await page.locator('#play').click();
  await page.waitForFunction(()=>!document.querySelector('#film').paused);
  await page.locator('[data-time]').nth(1).click();
  assert.equal(await page.locator('#film').evaluate(a=>a.paused),false);
  assert.equal(await page.locator('.cinema').getAttribute('data-shot'),'eunho');
  await page.goto(base+'starlight.html');for(let i=0;i<5;i++)await page.locator(`[data-star="${i}"]`).click();
  await page.locator('#finale').click();assert.equal(await page.locator('.ending-choices').isVisible(),false);await page.locator('.ending-next').click();assert.equal(await page.locator('.ending-choices').isVisible(),true);await page.locator('.ending-choices button').first().click();
  await page.locator('.ending-scene').screenshot({path:path.join(root,'tests','screenshots','iPhone-ending.png')});
  await page.locator('.ending-next').click();assert.equal(await page.locator('.ending-choices').isVisible(),false);
  await page.locator('.ending-scene img').scrollIntoViewIfNeeded();await page.locator('.ending-scene img').evaluate(img=>img.decode());
  await page.locator('.ending-scene').screenshot({path:path.join(root,'tests','screenshots','iPhone-ending-final.png')});
  await page.goto(base+'gift.html');await page.locator('.letter-open').click();
  await page.locator('.birthday-letter').screenshot({path:path.join(root,'tests','screenshots','iPhone-letter.png')});
  await page.evaluate(()=>{Storage.prototype.setItem=function(){throw new DOMException('Blocked','SecurityError');};});
  await page.locator('.letter-save').click();assert.match(await page.locator('.letter-status').textContent(),/無法保存/);
  const download=page.waitForEvent('download');await page.locator('.letter-export').click();await download;
  await page.locator('#tab-cards').click();await page.locator('.favorite-card').first().click();assert.match(await page.locator('.filter-status[role=status]').textContent(),/無法保存/);
  assert.equal(errors.length,0,errors.join('\n'));results.push({test:'reduced motion intro and continuous film, denied storage, export fallback and existing favorites error',pass:true});
  await context.close();
 }
 } finally {await browser.close();server.close();fs.writeFileSync(path.join(root,'tests',baseline?'baseline.json':visualOnly?'design-results.json':'smoke-results.json'),JSON.stringify(results,null,2));}
 console.log(`PASS ${results.length} page/device and functional checks`);
})().catch(e=>{console.error(e);process.exitCode=1;server.close();});
