'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),client=fs.readFileSync(path.join(root,'entry-notify.js'),'utf8');
const endpoint='https://formsubmit.co/ajax/kuoyen.ai@gmail.com';
function runtime({storage=new Map(),blockedStorage=false,disclosed=true,fetchImpl=()=>new Promise(()=>{})}={}){
 const buttons=Object.fromEntries(['introStart','introSkip'].map(id=>[id,{disabled:false,listeners:[],addEventListener(type,fn,options){this.listeners.push({type,fn,options});}}]));
 const storageApi={getItem(k){if(blockedStorage)throw Error('Storage blocked');return storage.get(k)||null;},setItem(k,v){if(blockedStorage)throw Error('Storage blocked');storage.set(k,v);}};
 const context={sessionStorage:storageApi,fetch:fetchImpl,document:{getElementById(id){
  if(id==='cinemaIntro')return {querySelector(){return disclosed?{}:null;}};
  if(!Object.hasOwn(buttons,id))assert.fail('must not read private content: '+id);return buttons[id];
 }}};
 vm.runInNewContext(client,context,{filename:'entry-notify.js'});
 return {buttons,click(id){for(const listener of buttons[id].listeners)listener.fn();}};
}
function verifyPayload(value,entry){
 assert.equal(value.name,'生日網站入口通知');assert.equal(value._subject,'YiTing｜網站入口通知');assert.equal(value._template,'table');
 assert.equal(value.entry,entry);assert.equal(value.source,'生日網站開場');assert.match(value.message,/無法確認訪客身分/);
 assert.ok(Number.isFinite(Date.parse(value.time)));assert.deepEqual(Object.keys(value).sort(),['_subject','_template','entry','message','name','source','time'].sort());
 assert.doesNotMatch(JSON.stringify(value),/private|device|visitor-id|reply|wish|query/i);
}
test('page loading sends nothing; pending fetch never blocks the original click',()=>{
 const calls=[],r=runtime({fetchImpl:(url,options)=>{calls.push({url,options});return new Promise(()=>{});}});assert.equal(calls.length,0);
 let continued=false;r.buttons.introStart.listeners.push({fn(){continued=true;}});r.click('introStart');assert.equal(continued,true);assert.equal(calls.length,1);
 assert.equal(calls[0].url,endpoint);const options=calls[0].options;assert.equal(options.method,'POST');assert.equal(options.keepalive,true);assert.equal(options.credentials,'omit');assert.equal(options.referrerPolicy,'origin');
 assert.equal(options.headers['Content-Type'],'application/json');assert.equal(options.headers.Accept,'application/json');verifyPayload(JSON.parse(options.body),'開啟星光之門');
 r.click('introStart');r.click('introSkip');assert.equal(calls.length,1);
});
test('skip directly uses the same fixed FormSubmit endpoint with its own label',()=>{
 const calls=[],r=runtime({fetchImpl:(url,options)=>{calls.push({url,options});return Promise.resolve({json:async()=>({success:true})});}});
 r.click('introSkip');assert.equal(calls[0].url,endpoint);verifyPayload(JSON.parse(calls[0].options.body),'略過開場');
});
test('disabled buttons cannot notify',()=>{
 const r=runtime({fetchImpl:()=>assert.fail('disabled button sent')});r.buttons.introStart.disabled=true;r.buttons.introSkip.disabled=true;r.click('introStart');r.click('introSkip');
});
test('a cached script cannot notify from old undisclosed markup',()=>{
 const r=runtime({disclosed:false,fetchImpl:()=>assert.fail('undisclosed markup sent')});r.click('introStart');r.click('introSkip');
});
test('the per-tab flag survives reinitialization without a visitor identifier',()=>{
 const storage=new Map(),calls=[];for(let n=0;n<2;n++){const r=runtime({storage,fetchImpl:(...args)=>{calls.push(args);return Promise.resolve({json:async()=>({success:true})});}});r.click('introSkip');}
 assert.equal(calls.length,1);assert.deepEqual([...storage.values()],['1']);
});
test('an existing attempt flag prevents all duplicate clicks',()=>{
 const r=runtime({storage:new Map([['yiting-entry-notify-attempted-v1','1']]),fetchImpl:()=>assert.fail('duplicate')});r.click('introStart');r.click('introSkip');
});
test('blocked session storage falls back to in-memory one-attempt behavior',()=>{
 let count=0;const r=runtime({blockedStorage:true,fetchImpl:()=>{count++;return new Promise(()=>{});}});r.click('introStart');r.click('introSkip');assert.equal(count,1);
});
test('a synchronous fetch failure does not block or retry',()=>{
 let count=0;const r=runtime({fetchImpl:()=>{count++;throw Error('Offline');}});assert.doesNotThrow(()=>r.click('introStart'));r.click('introSkip');assert.equal(count,1);
});
test('a rejected fetch is handled without an unhandled rejection or retry',async()=>{
 let count=0;const r=runtime({fetchImpl:()=>{count++;return Promise.reject(Error('Offline'));}});r.click('introStart');await new Promise(resolve=>setImmediate(resolve));r.click('introSkip');assert.equal(count,1);
});
for(const success of [true,false,'true','false'])test('provider JSON is consumed in the background without UI or retries: '+success,async()=>{
 let calls=0,reads=0;const r=runtime({fetchImpl:()=>{calls++;return Promise.resolve({json:async()=>{reads++;return {success};}});}});r.click('introStart');await new Promise(resolve=>setImmediate(resolve));assert.equal(reads,1);r.click('introSkip');assert.equal(calls,1);
});
test('non-JSON provider failure is handled silently and never automatically resent',async()=>{
 let count=0;const r=runtime({fetchImpl:()=>{count++;return Promise.resolve({json:async()=>{throw Error('Not JSON');}});}});r.click('introStart');await new Promise(resolve=>setImmediate(resolve));r.click('introSkip');assert.equal(count,1);
});
test('transport matches the existing voluntary-sharing design, while private fields remain excluded',()=>{
 const sharing=fs.readFileSync(path.join(root,'wish-sharing.js'),'utf8');assert.ok(sharing.includes("endpoint='https://formsubmit.co/ajax/'+recipient"));assert.ok(sharing.includes("'Accept':'application/json'"));
 assert.ok(client.includes("endpoint='https://formsubmit.co/ajax/kuoyen.ai@gmail.com'"));assert.ok(!client.includes('/api/entry-notify'));assert.ok(!client.includes('localStorage'));
 assert.ok(!client.includes('innerHTML')&&!client.includes('textContent'));
});
test('English policy accurately discloses direct FormSubmit processing and preserves all creation terms',()=>{
 const html=fs.readFileSync(path.join(root,'privacy.html'),'utf8');assert.match(html,/<html lang="en">/);assert.doesNotMatch(html,/[\u3400-\u9fff]/);
 for(const term of ['Entry-click email notifications','email the website creator','not merely an on-page visit counter','direct browser request','IP address','public website origin','unofficial, non-commercial','not statements made by the actual members','grants no license'])assert.ok(html.includes(term),term);
 assert.ok(!html.includes('entry-notify.js'));assert.ok(!html.includes('Vercel server function'));
 const index=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.ok(index.indexOf('intro-privacy')>index.indexOf('<div class="intro-action">'));assert.ok(index.indexOf('intro-privacy')<index.indexOf('<header class="home-header">'));
 assert.equal((index.match(/src="entry-notify.js/g)||[]).length,1);assert.ok(index.indexOf('src="entry-notify.js')<index.indexOf('src="cinema-intro.js'));
});
