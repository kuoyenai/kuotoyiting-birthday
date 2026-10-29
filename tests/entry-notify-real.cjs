'use strict';
// Opt-in only: this script can send two real notifications to the existing owner.
if(!process.argv.includes('--send-two-real-notifications')||!process.argv.includes('--recipient=kuoyen.ai@gmail.com')){
 console.log('SKIP real email verification: explicit owner authorization and both opt-in arguments are required.');
 process.exit(0);
}
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const endpoint='https://formsubmit.co/ajax/kuoyen.ai@gmail.com';
const output=path.resolve(__dirname,'../../material-review/entry-notify-real-results.json');
const report={appVersion:'20261029-80',transport:'direct FormSubmit browser AJAX',startedAtUtc:new Date().toISOString(),recipient:'kuoyen.ai@gmail.com',
 notificationSubject:'YiTing｜網站入口通知',productionMessageFormatUnchanged:true,
 testIdentification:'Owner-authorized synthetic browser clicks; identify the two emails by button and recorded time.',
 maxRealPostRequests:2,realPostRequests:0,attempts:[],inboxDeliveryConfirmed:false};
fs.mkdirSync(path.dirname(output),{recursive:true});
function save(){fs.writeFileSync(output,JSON.stringify(report,null,2)+'\n');}
function taipei(iso){return new Intl.DateTimeFormat('zh-TW',{dateStyle:'medium',timeStyle:'medium',timeZone:'Asia/Taipei'}).format(new Date(iso));}
save();
(async()=>{
 const proxy=process.env.HTTPS_PROXY||process.env.HTTP_PROXY;
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_PATH?{executablePath:process.env.CHROME_PATH}:{}),...(proxy?{proxy:{server:proxy}}:{})});
 try{
  for(const item of [
   {site:'https://kuotoyiting-birthday.vercel.app/',button:'introStart',entry:'gate',label:'開啟星光之門'},
   {site:'https://kuoyenai.github.io/kuotoyiting-birthday/',button:'introSkip',entry:'skip',label:'略過開場'}
  ]){
   const attempt={site:item.site,button:item.label,entry:item.entry,realPostSent:false,providerAccepted:false};report.attempts.push(attempt);save();
   const page=await browser.newPage({viewport:{width:390,height:844},serviceWorkers:'block'}),errors=[];page.setDefaultTimeout(20000);
   page.on('pageerror',error=>errors.push(error.message));let armed=false;
   await page.addInitScript(({endpoint})=>{
    localStorage.setItem('yiting-music-preferences',JSON.stringify({index:0,paused:true}));
    const original=window.fetch.bind(window);
    window.fetch=(...args)=>{
     const result=original(...args);
     if(String(args[0])===endpoint)result.then(response=>{
      response.clone().json().then(data=>{
       window.__ownerEntryVerification={httpStatus:response.status,success:data.success,
        classification:/activat|confirm.*email|verify.*email/i.test(String(data.message||''))?'activation_required':'service_reply'};
      }).catch(()=>{window.__ownerEntryVerification={httpStatus:response.status,nonJson:true};});
     }).catch(()=>{window.__ownerEntryVerification={networkFailed:true};});
     return result;
    };
   },{endpoint});
   await page.route('**/*',async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.href===endpoint){
     if(request.method()==='OPTIONS'){await route.continue();return;}
     const body=request.postDataJSON();
     if(!armed||request.method()!=='POST'||report.realPostRequests>=2||body.entry!==item.label||body._subject!=='YiTing｜網站入口通知'||Object.keys(body).sort().join(',')!==['_subject','_template','entry','message','name','source','time'].sort().join(',')){
      await route.abort('blockedbyclient');return;
     }
     armed=false;report.realPostRequests++;attempt.realPostSent=true;attempt.requestPayload=body;
     attempt.clickedAtUtc=new Date().toISOString();attempt.clickedAtTaipei=taipei(attempt.clickedAtUtc);
     assert.equal(request.headers().referer,new URL(item.site).origin+'/','production notification includes only the public origin as referrer');save();
     // Continue this one authorized real request to the original FormSubmit service.
     await route.continue();return;
    }
    if(url.hostname==='formsubmit.co'||!['GET','HEAD'].includes(request.method())||request.resourceType()==='media'){
     await route.abort('blockedbyclient');return;
    }
    await route.continue();
   });
   try{
    await page.goto(item.site+'index.html',{waitUntil:'load',timeout:45000});
    await page.frameLocator('#birthdayContent').locator('#'+item.button).waitFor();
    const frame=page.frames().find(f=>f.parentFrame()&&new URL(f.url()).pathname.endsWith('/index.html'));
    await frame.waitForFunction(()=>document.readyState==='complete'&&document.fonts.status==='loaded');
    assert.equal(await frame.locator('meta[name="app-version"]').getAttribute('content'),'20261029-80','real verification must use the deployed repaired version');
    assert.ok(await frame.locator('#cinemaIntro .intro-privacy').isVisible());
    assert.equal(attempt.realPostSent,false,'page load alone does not send');
    const responseReady=page.waitForResponse(response=>response.url()===endpoint&&response.request().method()==='POST',{timeout:25000});
    armed=true;await frame.locator('#'+item.button).click({noWaitAfter:true,timeout:15000});
    const response=await responseReady;
    attempt.httpStatus=response.status();attempt.responseAtUtc=new Date().toISOString();attempt.serverDate=response.headers().date;save();
    try{
     await frame.waitForFunction(()=>window.__ownerEntryVerification!==undefined,undefined,{timeout:6000});
     attempt.response=await frame.evaluate(()=>window.__ownerEntryVerification);
    }catch{attempt.response={bodyReadTimedOut:true};}
    attempt.providerAccepted=attempt.httpStatus===200&&(attempt.response.success===true||attempt.response.success==='true');save();
    await frame.locator('#cinemaIntro').waitFor({state:'detached',timeout:12000});
    attempt.openingContinued=true;
    assert.doesNotMatch(await frame.locator('body').innerText(),/正在寄信|已通知|寄送成功|kuoyen\.ai@gmail\.com/);
    attempt.pageErrors=errors;
    console.log(JSON.stringify({button:item.label,clickedAtTaipei:attempt.clickedAtTaipei,httpStatus:attempt.httpStatus,providerAccepted:attempt.providerAccepted}));
   }catch(error){attempt.error=String(error).split('\n')[0];console.log(JSON.stringify({button:item.label,error:attempt.error,realPostSent:attempt.realPostSent,providerAccepted:attempt.providerAccepted}));}
   finally{save();await page.close();}
  }
 }finally{
  await browser.close();report.completedAtUtc=new Date().toISOString();
  report.bothProviderAccepted=report.attempts.length===2&&report.attempts.every(a=>a.providerAccepted);save();
 }
 console.log('Real notification POSTs: '+report.realPostRequests+'; provider acceptance: '+report.bothProviderAccepted+'; inbox delivery not independently verified.');
 if(!report.bothProviderAccepted)process.exitCode=1;
})().catch(error=>{report.error=String(error).split('\n')[0];save();console.error(report.error);process.exitCode=1;});
