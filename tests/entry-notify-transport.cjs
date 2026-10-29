'use strict';
// Read-only diagnostics: this script never permits POST requests.
const fs=require('node:fs'),path=require('node:path');
const output=path.resolve(__dirname,'../../material-review/formsubmit-connection-diagnostics.json');
fs.mkdirSync(path.dirname(output),{recursive:true});
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const {endpoint,probePreflight}=require('./entry-notify-readiness.cjs');
const report={startedAtUtc:new Date().toISOString(),realEmailPostsPermitted:0,responses:[],failures:[],consoleErrors:[]};
(async()=>{
 const proxy=process.env.HTTPS_PROXY||process.env.HTTP_PROXY;
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),...(proxy?{proxy:{server:proxy}}:{})});
 try{
  const page=await browser.newPage({serviceWorkers:'block'});page.setDefaultTimeout(15000);
  await page.addInitScript(()=>localStorage.setItem('yiting-music-preferences',JSON.stringify({index:0,paused:true})));
  page.on('response',r=>{if(r.url().startsWith('https://formsubmit.co/'))report.responses.push({url:r.url(),method:r.request().method(),status:r.status(),server:r.headers().server,contentType:r.headers()['content-type']});});
  page.on('requestfailed',r=>{if(r.url().startsWith('https://formsubmit.co/'))report.failures.push({url:r.url(),method:r.method(),failure:r.failure()});});
  page.on('console',message=>{if(message.type()==='error'&&message.text().includes('formsubmit.co'))report.consoleErrors.push(message.text().slice(0,600));});
  await page.route('**/*',async route=>{
   if(!['GET','HEAD','OPTIONS'].includes(route.request().method())||route.request().resourceType()==='media'){await route.abort('blockedbyclient');return;}
   await route.continue();
  });
  await page.goto('https://kuotoyiting-birthday.vercel.app/index.html',{waitUntil:'load',timeout:30000});
  await page.frameLocator('#birthdayContent').locator('#introStart').waitFor();
  const frame=page.frames().find(f=>f.parentFrame()&&new URL(f.url()).pathname.endsWith('/index.html'));
  report.siteVersion=await frame.locator('meta[name="app-version"]').getAttribute('content');
  report.corsGet=await frame.evaluate(async endpoint=>{
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),7000);
   try{const r=await fetch(endpoint,{method:'GET',headers:{Accept:'application/json'},credentials:'omit',referrerPolicy:'origin',signal:controller.signal});return {status:r.status,type:r.type};}
   catch(error){return {error:String(error)};}finally{clearTimeout(timer);}
  },endpoint);
  report.preflight=await probePreflight(page.context().request,'https://kuotoyiting-birthday.vercel.app');
  try{
   const r=await page.goto('https://formsubmit.co/documentation',{waitUntil:'domcontentloaded',timeout:15000});
   report.documentationGet={status:r.status(),server:r.headers().server};
  }catch(error){report.documentationGet={error:String(error).split('\n')[0]};}
 }finally{await browser.close();}
 report.ready=report.preflight?.ready===true;
 report.completedAtUtc=new Date().toISOString();fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
 if(!report.ready)process.exitCode=1;
})().catch(error=>{report.error=String(error).split('\n')[0];fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');console.error(report.error);process.exitCode=1;});
