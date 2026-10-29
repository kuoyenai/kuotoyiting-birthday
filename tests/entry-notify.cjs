'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),{createHandler}=require('../api/entry-notify.js');
const client=fs.readFileSync(path.join(root,'entry-notify.js'),'utf8');
const origin='https://kuotoyiting-birthday.vercel.app';
function response(){return {headers:{},setHeader(k,v){this.headers[k]=v;},status(n){this.code=n;return this;},json(value){this.body=value;},end(){this.ended=true;}};}
function request(patch={}){return {method:'POST',headers:{origin,'content-type':'application/json','x-forwarded-for':'private-network-value','user-agent':'private-device-value'},body:{entry:'gate'},...patch};}
function runtime({storage=new Map(),blockedStorage=false,disclosed=true,fetchImpl=()=>new Promise(()=>{})}={}){
 const buttons=Object.fromEntries(['introStart','introSkip'].map(id=>[id,{disabled:false,listeners:[],addEventListener(type,fn,options){this.listeners.push({type,fn,options});}}]));
 const storageApi={getItem(k){if(blockedStorage)throw Error('Storage blocked');return storage.get(k)||null;},setItem(k,v){if(blockedStorage)throw Error('Storage blocked');storage.set(k,v);}};
 let domReads=0;
 const context={sessionStorage:storageApi,fetch:fetchImpl,document:{getElementById(id){domReads++;if(id==='cinemaIntro')return {querySelector(){return disclosed?{}:null;}};return buttons[id];}}};
 vm.runInNewContext(client,context,{filename:'entry-notify.js'});
 return {buttons,click(id){for(const listener of buttons[id].listeners)listener.fn();},get domReads(){return domReads;}};
}

test('page loading sends nothing; a pending request never blocks a button handler',()=>{
 const calls=[],r=runtime({fetchImpl:(url,options)=>{calls.push({url,options});return new Promise(()=>{});}});
 assert.equal(calls.length,0);
 let entryContinued=false;r.buttons.introStart.listeners.push({fn(){entryContinued=true;}});
 r.click('introStart');assert.equal(entryContinued,true);assert.equal(calls.length,1);
 const {url,options}=calls[0];assert.equal(url,origin+'/api/entry-notify');assert.equal(options.method,'POST');
 assert.equal(options.keepalive,true);assert.equal(options.credentials,'omit');assert.equal(options.referrerPolicy,'no-referrer');
 assert.deepEqual(JSON.parse(options.body),{entry:'gate'});
 r.click('introStart');r.click('introSkip');assert.equal(calls.length,1,'one attempt across both buttons');
});
test('skip has its own event; disabled buttons and old undisclosed markup cannot send',()=>{
 const calls=[],r=runtime({fetchImpl:(...args)=>{calls.push(args);return Promise.resolve({ok:true});}});
 r.buttons.introStart.disabled=true;r.click('introStart');assert.equal(calls.length,0);
 r.click('introSkip');assert.equal(JSON.parse(calls[0][1].body).entry,'skip');
 const old=runtime({disclosed:false,fetchImpl:()=>assert.fail('undisclosed page sent')});old.click('introStart');
});
test('tab-session flag survives reinitialization without a visitor identifier',()=>{
 const storage=new Map(),calls=[];
 for(let n=0;n<2;n++){const r=runtime({storage,fetchImpl:(...args)=>{calls.push(args);return Promise.resolve({ok:true});}});r.click('introSkip');}
 assert.equal(calls.length,1);assert.deepEqual([...storage.values()],['1']);
});
test('storage and synchronous/asynchronous network failures leave the click usable',async()=>{
 for(const fetchImpl of [()=>{throw Error('Offline');},()=>Promise.reject(Error('Offline'))]){
  const r=runtime({blockedStorage:true,fetchImpl});assert.doesNotThrow(()=>r.click('introStart'));assert.doesNotThrow(()=>r.click('introSkip'));
 }
 await new Promise(resolve=>setImmediate(resolve));
});
test('a normal re-entry with its existing session flag does not send again',()=>{
 const storage=new Map([['yiting-entry-notify-attempted-v1','1']]);
 const r=runtime({storage,fetchImpl:()=>assert.fail('repeat attempt')});r.click('introStart');r.click('introSkip');
});

for(const site of [origin,'https://kuoyenai.github.io'])test('relay accepts only the fixed event payload from '+site,async()=>{
 const calls=[],handler=createHandler({now:()=>new Date('2026-10-29T04:00:00Z'),fetchImpl:async(url,options)=>{calls.push({url,options});return {ok:true,json:async()=>({success:'true'})};}}),res=response();
 await handler(request({headers:{origin:site,'content-type':'application/json','x-forwarded-for':'private-network-value'},body:JSON.stringify({entry:'skip'})}),res);
 assert.equal(res.code,202);assert.deepEqual(res.body,{accepted:true});assert.equal(res.headers['Access-Control-Allow-Origin'],site);assert.equal(res.headers['Cache-Control'],'no-store');
 assert.equal(calls.length,1);assert.equal(calls[0].url,'https://formsubmit.co/ajax/kuoyen.ai@gmail.com');
 const payload=JSON.parse(calls[0].options.body);assert.equal(payload.entry,'略過開場');assert.equal(payload.time,'2026-10-29T04:00:00.000Z');
 assert.equal(payload._subject,'YiTing｜網站入口通知');assert.match(payload.message,/無法確認訪客身分/);
 assert.deepEqual(Object.keys(payload).sort(),['_subject','_template','entry','message','name','taipeiTime','time'].sort());
 assert.doesNotMatch(JSON.stringify(calls),/private-network-value|private-device-value/);assert.equal(calls[0].options.redirect,'error');
});
test('preflight and unsupported methods never email',async()=>{
 const handler=createHandler({fetchImpl:()=>assert.fail('must not send')});
 const preflight=response();await handler(request({method:'OPTIONS'}),preflight);assert.equal(preflight.code,204);
 const get=response();await handler(request({method:'GET'}),get);assert.equal(get.code,405);assert.equal(get.headers.Allow,'POST, OPTIONS');
});
for(const badOrigin of [undefined,'null','https://evil.example','https://kuotoyiting-birthday.vercel.app.evil.example'])test('rejects origin '+badOrigin,async()=>{
 const handler=createHandler({fetchImpl:()=>assert.fail('untrusted origin sent')}),res=response();
 await handler(request({headers:{origin:badOrigin,'content-type':'application/json'}}),res);assert.equal(res.code,403);assert.equal(res.headers['Access-Control-Allow-Origin'],undefined);
});
for(const body of [{entry:'other'},{entry:'__proto__'},{entry:'gate',to:'other@example.com'},{entry:'gate',message:'private wish'},[],null,'invalid','x'.repeat(129)])test('rejects unsupported event or extra visitor data: '+JSON.stringify(body),async()=>{
 const handler=createHandler({fetchImpl:()=>assert.fail('invalid payload sent')}),res=response();await handler(request({body}),res);assert.equal(res.code,400);
});
test('rejects non-JSON content without sending',async()=>{
 const handler=createHandler({fetchImpl:()=>assert.fail('wrong content type sent')}),res=response();
 await handler(request({headers:{origin,'content-type':'text/plain'}}),res);assert.equal(res.code,415);
});
for(const mode of ['http','activation','json','network'])test('relay reports '+mode+' failure without falsely acknowledging delivery',async()=>{
 const handler=createHandler({fetchImpl:async()=>{
  if(mode==='network')throw Error('Network failure');
  return {ok:mode!=='http',json:async()=>{if(mode==='json')throw Error('Bad JSON');return {success:false,message:'Activation required'};}};
 }}),res=response();await handler(request(),res);assert.equal(res.code,503);assert.deepEqual(res.body,{accepted:false});
});
test('privacy page is fully English and explicitly discloses email notifications and fan-creation terms',()=>{
 const html=fs.readFileSync(path.join(root,'privacy.html'),'utf8');assert.match(html,/<html lang="en">/);assert.doesNotMatch(html,/[\u3400-\u9fff]/);
 for(const term of ['Entry-click email notifications','email the website creator','not merely an on-page visit counter','FormSubmit','unofficial, non-commercial','not statements made by the actual members','grants no license'])assert.ok(html.includes(term),term);
 assert.ok(!html.includes('entry-notify.js'),'reading the policy does not send an entry event');
 const index=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(index.indexOf('intro-privacy')>index.indexOf('<div class="intro-action">'));
 assert.ok(index.indexOf('intro-privacy')<index.indexOf('<header class="home-header">'),'small policy link remains inside the opening');
 assert.equal((index.match(/src="entry-notify.js/g)||[]).length,1);assert.ok(index.indexOf('src="entry-notify.js')<index.indexOf('src="cinema-intro.js'));
 assert.ok(!client.includes('innerHTML')&&!client.includes('textContent'),'notification module does not write interface content');
});
