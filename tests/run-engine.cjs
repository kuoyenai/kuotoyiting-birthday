// Reuse the existing browser checks without changing production code or their assertions.
const path=require('path'),fs=require('fs'),Module=require('module');
const engine=process.argv[2],test=process.argv[3];
if(!['chromium','webkit','firefox'].includes(engine)||!test||path.basename(test)!==test||!test.endsWith('.cjs')||test==='run-engine.cjs')throw Error('Usage: node tests/run-engine.cjs <chromium|webkit|firefox> <test.cjs>');
const file=path.join(__dirname,test);if(!fs.existsSync(file))throw Error('Unknown test: '+test);
const packageName=process.env.PLAYWRIGHT_MODULE||'playwright',api=require(packageName),load=Module._load;
const browser={launch:options=>{const settings={...options};if(engine!=='chromium')delete settings.executablePath;return api[engine].launch(settings);}};
const facade=new Proxy(api,{get:(target,key)=>key==='chromium'?browser:Reflect.get(target,key)});
Module._load=function(request,parent,isMain){return request===packageName?facade:load.call(this,request,parent,isMain);};
process.env.YITING_TEST_ENGINE=engine;
console.log('ENGINE '+engine+' / '+test+' / desktop engine, not a physical iOS device');
try{require(file);}finally{Module._load=load;}
