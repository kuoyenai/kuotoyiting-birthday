const fs=require('fs'),path=require('path'),http=require('http'),vm=require('vm'),assert=require('assert');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..'),ctx={window:{}};vm.createContext(ctx);
for(const f of ['novel-comic-data.js','novel-extra-shots.js','card-story-links.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
const data=ctx.window,expected=[];
for(let chapter=0;chapter<data.NOVEL_PANELS.length;chapter++){
 const rows=data.NOVEL_PANELS[chapter].map((row,panel)=>({asset:row[0],chapter,panel,narration:row[1]}));
 for(const s of data.YITING_EXTRA_SHOTS.filter(s=>s.chapter===chapter)){
  const after=rows.findIndex(r=>r.asset===s.after);if(after<0)throw Error('missing anchor '+s.after);
  rows.splice(after+1,0,{asset:s.asset,chapter,panel:s.id,narration:s.narration});
 }
 rows.forEach((s,i)=>expected.push({...s,sequence:i+1}));
}
assert.strictEqual(expected.length,95,'The complete novel retains 95 panels');
assert.strictEqual(expected.filter(s=>s.panel>=100).length,17,'All 17 supplementary panels remain present');
assert.deepStrictEqual(Array.from({length:10},(_,chapter)=>expected.filter(s=>s.chapter===chapter).length),[4,4,6,6,26,11,9,10,10,9]);
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.m4a':'audio/mp4','.mp4':'video/mp4','.woff2':'font/woff2','.json':'application/json'};
const server=http.createServer((req,res)=>{
 const uri=decodeURIComponent(new URL(req.url,'http://localhost').pathname),f=path.resolve(root,'.'+(uri==='/'?'/index.html':uri));
 if(!f.startsWith(root+path.sep)||!fs.existsSync(f)||!fs.statSync(f).isFile()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res);
});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base='http://127.0.0.1:'+server.address().port+'/';
 const b=await chromium.launch({headless:true,executablePath:process.env.CHROME_PATH});
 try{
  const p=await b.newPage({viewport:{width:390,height:900}});await p.goto(base+'novel-comic.html#chapter-0-panel-100');
  await p.waitForFunction(()=>!!document.querySelector('iframe'));const f=p.frames().find(f=>f.parentFrame());
  await f.waitForSelector('#story-panel-100');const pass=[];
  for(const s of expected.filter(s=>s.panel>=100)){
   const hash='#chapter-'+s.chapter+'-panel-'+s.panel;await f.evaluate(hash=>location.hash=hash,hash);
   await f.waitForSelector('#story-panel-'+s.panel+'.story-return-target');
   const actual=await f.locator('#story-panel-'+s.panel).evaluate(el=>({chapter:document.body.dataset.storyChapter,asset:el.querySelector('img').getAttribute('src'),narration:el.querySelector('.panel-narration').textContent,sequence:el.querySelector('.panel-number').textContent,hash:location.hash}));
   const src=s.asset==='novel-bamby-dance-pause'?'assets/novel-bamby-dance-pause-v2.png':'assets/'+s.asset+'.webp';
   if(actual.chapter!==String(s.chapter)||actual.asset!==src||actual.narration!==s.narration||Number(actual.sequence)!==s.sequence||actual.hash!==hash)throw Error(JSON.stringify({s,actual}));pass.push(s.panel);
  }
  console.log('PASS actual Chrome deep links for all17 extras: '+pass.join(','));
  const ending=await f.locator('#panels .panel').evaluateAll(els=>els.map(el=>({id:el.id,src:el.querySelector('img').getAttribute('src'),number:el.querySelector('.panel-number').textContent})));
  console.log(JSON.stringify({chapter9:ending}));
  await p.goto(base+'gift.html#cards');await p.waitForFunction(()=>!!document.querySelector('iframe'));const g=p.frames().find(f=>f.parentFrame());
  await g.waitForSelector('[data-card-asset="novel-bamby-dance-pause"]');
  const gift=await g.locator('[data-card-asset="novel-bamby-dance-pause"]').evaluate(el=>({art:el.querySelector('img')?.getAttribute('src')||el.querySelector('.photocard')?.style.backgroundImage,link:el.querySelector('.card-story-link').getAttribute('href'),download:[...el.querySelectorAll('a')].map(a=>a.getAttribute('href')).filter(Boolean)}));
  const giftCardCount=await g.locator('[data-card-asset]').count();
  assert.strictEqual(giftCardCount,100,'All 100 cards remain rendered');
  const cardLinks=await g.locator('[data-card-asset]').evaluateAll(els=>els.map(el=>({asset:el.dataset.cardAsset,href:el.querySelector('.card-story-link').getAttribute('href')})));
  assert.strictEqual(new Set(cardLinks.map(c=>c.asset)).size,100,'Card assets are unique');
  const storyTargets=new Set(expected.map(s=>`novel-comic.html#chapter-${s.chapter}-panel-${s.panel}`));
  for(const card of cardLinks){assert.strictEqual(card.href,data.YITING_CARD_STORIES[card.asset],'Card uses its saved story link: '+card.asset);assert(storyTargets.has(card.href)||card.href==='game.html#page-3','Story target exists: '+card.asset);}
  assert.strictEqual(gift.art,'assets/novel-bamby-dance-pause-v2.png','Card uses the reviewed PNG');
  assert.strictEqual(gift.link,'novel-comic.html#chapter-4-panel-107','Card returns to its exact story');
  assert.strictEqual(gift.download.filter(href=>href==='assets/novel-bamby-dance-pause-v2.png').length,2,'Both save/original links use the reviewed PNG');
  console.log(JSON.stringify({giftCardCount,bamby:gift}));
  await p.goto(base+'explore.html');
  await p.evaluate(()=>localStorage.setItem('yiting-explore-story-v1',JSON.stringify({mapVersion:2,index:35,unlocked:36,x:13880})));
  await p.reload();await p.locator('#loading').waitFor({state:'hidden'});await p.locator('#interact').click();
  const explore=await p.locator('#storyArt').getAttribute('src');
  if(explore!=='assets/novel-bamby-dance-pause-v2.png')throw Error('Wrong explore Bamby '+explore);
  console.log(JSON.stringify({exploreBamby:explore}));
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e.stack);server.close();process.exitCode=1;});
