const fs=require('fs'),path=require('path'),http=require('http'),vm=require('vm'),assert=require('assert/strict');
const playwright=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const engineName=process.env.YITING_TEST_ENGINE==='webkit'?'webkit':'chromium',engine=playwright[engineName],reviewOnly=process.argv.includes('--review-only');
const root=path.resolve(__dirname,'..'),key='yiting-explore-story-v1';
const data={window:{}};vm.createContext(data);
for(const file of ['novel-comic-data.js','novel-extra-shots.js'])vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),data);
const route=[];data.window.NOVEL_PANELS.forEach((rows,chapter)=>rows.forEach(([asset,narration,lines,star],panel)=>{
 route.push({asset,narration,lines,star,chapter,panel});
 for(const shot of data.window.YITING_EXTRA_SHOTS.filter(s=>s.chapter===chapter&&s.after===asset))route.push({...shot,lines:[],panel:shot.id});
}));
const firsts=Array.from({length:10},(_,chapter)=>route.findIndex(s=>s.chapter===chapter));
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.m4a':'audio/mp4','.mp4':'video/mp4','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname),file=path.resolve(root,'.'+(name==='/'?'/index.html':name));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}
 const size=fs.statSync(file).size,range=/bytes=(\d+)-(\d*)/.exec(req.headers.range||''),start=range?Number(range[1]):0,end=range&&range[2]?Math.min(Number(range[2]),size-1):size-1;
 if(start>=size){res.writeHead(416);res.end();return;}
 res.writeHead(range?206:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Content-Length':end-start+1,...(range?{'Content-Range':`bytes ${start}-${end}/${size}`}:{})});
 if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file,{start,end}).pipe(res);
});
const state=p=>p.evaluate(key=>JSON.parse(localStorage.getItem(key)),key);
const ready=p=>p.locator('#loading').waitFor({state:'hidden'});
async function choose(p,chapter){await p.locator('#chapterMenu').selectOption(String(firsts[chapter]));await ready(p);}
async function reach(p){
 if(await p.locator('#story').evaluate(d=>d.open))return;
 const position=await p.locator('#world').evaluate(el=>({x:Number(el.dataset.playerX),waypoint:Number(el.dataset.waypoint)}));
 if(Math.abs(position.x-position.waypoint)>100){
  await p.locator('#world').focus();await p.keyboard.down('ArrowRight');await p.clock.runFor(3000);await p.keyboard.up('ArrowRight');
 }
 await p.waitForFunction(()=>!document.getElementById('interact').disabled);
 await p.locator('#interact').click();
}
async function readOne(p,expected){
 await reach(p);const index=Number(await p.locator('#world').getAttribute('data-index'));
 const replacements={'novel-bamby-dance-pause':'novel-bamby-dance-pause-v2','novel-bamby-closeup':'E00F34EB-9BDE-4825-883E-9EA4E8C618A4','novel-welcome-teasing':'D8AF4512-1868-4624-95B9-9FEC559B6A0C'};
 assert.ok((await p.locator('#storyArt').getAttribute('src')).includes(replacements[route[index].asset]||route[index].asset),'selected chapter starts at original story node');
 for(let line=0;Number(await p.locator('#world').getAttribute('data-index'))===index;line++){
  assert.ok(line<15,'dialogue advances');await p.locator('#continue').click();
 }
 expected.add(route[index].asset);return index;
}
async function closeStory(p){if(await p.locator('#story').evaluate(d=>d.open))await p.locator('#closeStory').click();}
async function checkRead(p,expected){
 const saved=await state(p);assert.deepEqual([...saved.completed].sort(),[...expected].sort(),'only actually read assets completed');
 let prefix=0;while(prefix<route.length&&expected.has(route[prefix].asset))prefix++;
 assert.equal(saved.unlocked,prefix,'legacy prefix stops at first unread asset');
 assert.equal(Number(await p.locator('#world').getAttribute('data-completed-count')),expected.size);
 assert.equal(Number(await p.locator('#journeyProgress').getAttribute('value')),expected.size);
}
async function newPage(browser,viewport,seed){
 const p=await browser.newPage({viewport,serviceWorkers:'block'});p.errors=[];p.on('pageerror',e=>p.errors.push(e.message));
 await p.addInitScript(({key,seed})=>{
  if(seed&&!localStorage.getItem(key))localStorage.setItem(key,JSON.stringify(seed));
  if(!localStorage.getItem('yiting-music-preferences'))localStorage.setItem('yiting-music-preferences',JSON.stringify({index:2,paused:true}));
 },{key,seed});
 await p.clock.install();return p;
}
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}/`;
 const browser=await engine.launch({headless:true,...(engineName==='chromium'&&process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{})});
 try{
  for(const viewport of reviewOnly?[]:[{width:390,height:844},{width:820,height:1180},{width:1280,height:844}]){
   const p=await newPage(browser,viewport),expected=new Set();await p.goto(base+'explore.html');await ready(p);await p.clock.pauseAt(new Date(Date.now()+1000));
   assert.equal(await p.locator('#chapterMenu option').count(),10);
   assert.equal(await p.locator('#chapterMenu option:disabled').count(),0,'all ten chapters available on first visit');
   for(let chapter=0;chapter<10;chapter++){
    await choose(p,chapter);assert.equal(Number(await p.locator('#world').getAttribute('data-index')),firsts[chapter]);await checkRead(p,expected);
   }
   await p.reload();await ready(p);assert.equal(Number(await p.locator('#world').getAttribute('data-index')),firsts[9]);await checkRead(p,expected);
   assert.equal(await p.locator('#fiveStars [aria-label$="已收集"]').count(),0);assert.equal(await p.locator('#world').getAttribute('data-keepsake'),'false');
   await readOne(p,expected);await closeStory(p);await checkRead(p,expected);
   await p.locator('#returnJourney').click();await ready(p);assert.equal((await state(p)).index,0);await checkRead(p,expected);
   await p.goto(base+'explore-intro.html');assert.ok((await p.locator('#journeyResume').textContent()).includes('已讀 1 / 95'));assert.ok(await p.locator('#resumeProgress').isVisible());
   await p.locator('#startJourney').click();await ready(p);await choose(p,5);
   const red=route.findIndex(s=>s.star==='red');while(Number(await p.locator('#world').getAttribute('data-index'))<=red)await readOne(p,expected);
   await closeStory(p);await checkRead(p,expected);
   assert.equal(await p.locator('#fiveStars [aria-label$="已收集"]').count(),1);assert.ok((await p.locator('#fiveStars').getAttribute('aria-label')).includes('陪伴'));
   await p.locator('#fiveStars').click();assert.equal(await p.locator('#starbookPages article img').count(),1);assert.equal(await p.locator('#starbookPages article[data-star="red"] img').count(),1);await p.locator('#closeJourneyStarbook').click();
   await choose(p,9);while(Number(await p.locator('#world').getAttribute('data-index'))<95)await readOne(p,expected);
   await checkRead(p,expected);assert.equal(await p.locator('#world').getAttribute('data-keepsake'),'false');
   await p.locator('#openFinale').click();assert.ok((await p.locator('.finale-complete').textContent()).includes(expected.size+' / 95'));assert.equal(await p.locator('.finale-stars span').evaluateAll(els=>els.filter(el=>el.textContent.startsWith('✦')).length),1);await p.locator('#closeFinale').click();
   assert.ok(!(await p.locator('#progress').textContent()).includes('旅程完成'));
   await p.reload();await ready(p);await checkRead(p,expected);await p.locator('#returnJourney').click();await ready(p);assert.equal((await state(p)).index,0);await checkRead(p,expected);
   assert.equal(await p.locator('#sound').getAttribute('aria-pressed'),'false','music mute preserved through chapter changes and reload');
   assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('yiting-music-preferences')).index),2);
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
   await p.clock.runFor(1000);
   await p.screenshot({path:path.join(root,'../material-review',`explore-free-chapters-${engineName}-${viewport.width}.png`)});
   assert.deepEqual(p.errors,[]);console.log(`PASS ${engineName} ${viewport.width}x${viewport.height}: all10 free chapter jumps, sparse reads/stars, reload, intro, ending, origin return, music`);await p.close();
  }
  for(const seed of reviewOnly?[]:[{mapVersion:2,index:48,unlocked:48,x:19450,reading:{asset:'novel-eunho-conversation',line:1}},{mapVersion:2,index:95,unlocked:95,x:37920}]){
   const p=await newPage(browser,{width:390,height:844},seed);await p.goto(base+'explore.html');await ready(p);await p.clock.pauseAt(new Date(Date.now()+1000));
   const expected=new Set(route.slice(0,seed.unlocked).map(s=>s.asset));await choose(p,9);await checkRead(p,expected);await p.reload();await ready(p);await p.locator('#returnJourney').click();await ready(p);await checkRead(p,expected);
   const saved=await state(p);assert.equal(saved.index,seed.index);assert.equal(saved.x,seed.x);assert.deepEqual(saved.reading,seed.reading||null);
   if(seed.reading){await reach(p);assert.equal(await p.locator('#speaker').textContent(),'銀虎');}else{await p.locator('#openFinale').click();assert.ok((await p.locator('.finale-complete').textContent()).includes('95 / 95'));}
   assert.deepEqual(p.errors,[]);console.log(`PASS ${engineName} legacy ${seed.index}/95 migration and exact origin/bookmark return`);await p.close();
  }
  const reviewStart=route.findIndex(s=>s.asset==='novel-eunho-conversation'),red=route.findIndex(s=>s.star==='red'),cursor=route.findIndex(s=>s.asset==='novel-terrace-before-stage-wide');
  const p=await newPage(browser,{width:390,height:844},{mapVersion:2,index:cursor,unlocked:0,completed:[],x:280+reviewStart*400});
  await p.goto(base+'explore.html');await ready(p);await p.locator('#interact').click();const expected=new Set();
  for(let i=reviewStart;i<=red;i++){
   for(let line=0;line<=route[i].lines.length;line++)await p.locator('#continue').click();
   expected.add(route[i].asset);await checkRead(p,expected);assert.equal((await state(p)).index,cursor,'backtracking preserves later cursor');
  }
  assert.equal(await p.locator('#fiveStars [aria-label$="已收集"]').count(),1,'reading an earlier skipped star refreshes badges before closing the next fixed panel');
  await closeStory(p);await checkRead(p,expected);await p.locator('#restart').click();await p.locator('#confirmRestart').click();await ready(p);await checkRead(p,new Set());
  assert.equal(await p.locator('#chapterMenu option:disabled').count(),0);assert.deepEqual(p.errors,[]);console.log(`PASS ${engineName} backtracking reads skipped fixed scenes, live earned-star refresh, origin retained, reset clears sparse reads`);await p.close();
 }finally{await browser.close();server.close();}
})().catch(error=>{console.error(error.stack);server.close();process.exitCode=1;});
