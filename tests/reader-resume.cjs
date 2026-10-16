const fs=require('fs'),path=require('path'),http=require('http');const{chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root=path.resolve(__dirname,'..'),report=[],mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.m4a':'audio/mp4','.mp4':'video/mp4','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{const name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);const file=path.resolve(root,'.'+(name==='/'?'/index.html':name));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return;}const size=fs.statSync(file).size,range=/bytes=(\d+)-(\d*)/.exec(req.headers.range||''),start=range?Number(range[1]):0,end=range&&range[2]?Math.min(Number(range[2]),size-1):size-1;if(start>=size){res.writeHead(416);res.end();return;}res.writeHead(range?206:200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Accept-Ranges':'bytes','Content-Length':end-start+1,...(range?{'Content-Range':`bytes ${start}-${end}/${size}`}:{})});if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file,{start,end}).pipe(res);});
(async()=>{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const base=`http://127.0.0.1:${server.address().port}/`;
 const b=await chromium.launch({...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),headless:true});
 try{
  const p=await b.newPage({viewport:{width:390,height:844},serviceWorkers:'block'});
  const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(base+'novel-comic.html#chapter-5-panel-109');
  let f=p.frames().find(x=>x.parentFrame());
  await f.locator('#story-panel-109').waitFor();
  await f.locator('#story-panel-109').evaluate(el=>el.scrollIntoView({block:'start',behavior:'instant'}));
  await f.waitForFunction(()=>JSON.parse(localStorage.getItem('yiting-novel-panel-positions')||'{}')[5]?.panel===109);
  await p.goto(base+'novel-comic.html?resume-check=1');
  f=p.frames().find(x=>x.parentFrame());
  await f.waitForFunction(()=>document.body.dataset.readingPanel==='109');
  await p.waitForTimeout(1500);const top=await f.locator('#story-panel-109').evaluate(el=>el.getBoundingClientRect().top);
  if(top < -400 || top > 650)throw Error('Saved panel not visible: '+top);
  console.log('PASS reopening novel restores saved chapter 5 / panel 109');
  await p.goto(base+'novel-comic.html?resume-check=2#chapter-4-panel-17');
  f=p.frames().find(x=>x.parentFrame());
  await f.locator('#story-panel-17').waitFor();await p.waitForTimeout(1200);const bookmarkTop=await f.locator('#story-panel-17').evaluate(el=>el.getBoundingClientRect().top);if(bookmarkTop < -200 || bookmarkTop > 300)throw Error('Bookmark target outside viewport: '+bookmarkTop);
  if(await f.locator('body').getAttribute('data-story-chapter')!=='4')throw Error('Explicit chapter ignored');
  if(errors.length)throw Error(errors.join('\n'));
  console.log('PASS explicit story bookmark overrides previous reading position; no script errors');
 }finally{await b.close();server.close();}
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});





