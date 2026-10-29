'use strict';

const origins=new Set(['https://kuotoyiting-birthday.vercel.app','https://kuoyenai.github.io']);
const labels=Object.freeze({gate:'開啟星光之門',skip:'略過開場'});
const endpoint='https://formsubmit.co/ajax/kuoyen.ai@gmail.com';

function createHandler({fetchImpl=globalThis.fetch,now=()=>new Date()}={}){
 return async function entryNotify(req,res){
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Vary','Origin');
  const origin=req.headers.origin;
  if(!origins.has(origin)){res.status(403).json({accepted:false});return;}
  res.setHeader('Access-Control-Allow-Origin',origin);
  res.setHeader('Access-Control-Allow-Methods','POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS'){res.status(204).end();return;}
  if(req.method!=='POST'){
   res.setHeader('Allow','POST, OPTIONS');res.status(405).json({accepted:false});return;
  }
  if(!/^application\/json(?:\s*;|$)/i.test(req.headers['content-type']||'')){
   res.status(415).json({accepted:false});return;
  }
  let body;
  try{
   const raw=Buffer.isBuffer(req.body)?req.body.toString('utf8'):req.body;
   if(typeof raw==='string'&&Buffer.byteLength(raw)>128)throw new Error('Too large');
   body=typeof raw==='string'?JSON.parse(raw):raw;
   if(!body||Array.isArray(body)||typeof body!=='object'||Object.keys(body).length!==1||
    !Object.hasOwn(body,'entry')||!Object.hasOwn(labels,body.entry))throw new Error('Invalid entry');
  }catch{res.status(400).json({accepted:false});return;}
  try{
   const time=now();
   // Construct a fixed payload: never forward visitor headers, URLs, or text.
   const payload={name:'生日網站入口通知',_subject:'YiTing｜網站入口通知',_template:'table',
    message:'有人按下「'+labels[body.entry]+'」。這僅代表入口點擊，無法確認訪客身分或是否已閱讀網站。',
    entry:labels[body.entry],time:time.toISOString(),
    taipeiTime:new Intl.DateTimeFormat('zh-TW',{dateStyle:'medium',timeStyle:'medium',timeZone:'Asia/Taipei'}).format(time)};
   const response=await fetchImpl(endpoint,{method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    redirect:'error',signal:AbortSignal.timeout(8000),body:JSON.stringify(payload)});
   const result=await response.json();
   if(!response.ok||(result.success!==true&&result.success!=='true'))throw new Error('Not accepted');
   res.status(202).json({accepted:true});
  }catch{res.status(503).json({accepted:false});}
 };
}

module.exports=createHandler();
module.exports.createHandler=createHandler;
