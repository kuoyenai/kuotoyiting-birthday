'use strict';
const assert=require('node:assert/strict');
const {endpoint,assessPreflight,probePreflight,assessSubmission}=require('./entry-notify-readiness.cjs');
const origin='https://kuotoyiting-birthday.vercel.app';
const valid={'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'content-type'};
const cases=[
 ['explicit CORS',204,valid,'','preflight_ready'],
 ['wildcard CORS',200,{'access-control-allow-origin':'*','access-control-allow-methods':'*','access-control-allow-headers':'*'},'','preflight_ready'],
 ['actual firewall failure',403,{},'error code: 1010\n','access_denied_1010'],
 ['plain forbidden',403,{},'Forbidden','access_denied'],
 ['rate limit',429,{},'','rate_limited'],
 ['upstream521',521,{},'','service_unavailable'],
 ['redirect',301,valid,'','preflight_http_error'],
 ['wrong origin',204,{...valid,'Access-Control-Allow-Origin':'https://example.com'},'','cors_origin_rejected'],
 ['missing origin',204,{},'','cors_origin_rejected'],
 ['safelisted POST needs no method permission',204,{...valid,'Access-Control-Allow-Methods':'GET'},'','preflight_ready'],
 ['missing JSON header',204,{...valid,'Access-Control-Allow-Headers':'accept'},'','cors_json_rejected']
];
(async()=>{
 for(const [name,status,headers,body,reason]of cases){
  const result=assessPreflight(status,headers,body,origin);
  assert.equal(result.reason,reason,name);assert.equal(result.ready,reason==='preflight_ready',name);
 }
 let calls=0;
 const failure=await probePreflight({fetch:async(url,options)=>{
  calls++;assert.equal(url,endpoint);assert.equal(options.method,'OPTIONS');assert.equal(options.maxRedirects,0);
  assert.equal(options.headers.Origin,origin);assert.equal(options.body,undefined);assert.equal(options.data,undefined);
  return {status:()=>403,headers:()=>({server:'envoy'}),text:async()=>'error code: 1010'};
 }},origin);
 assert.equal(calls,1);assert.equal(failure.ready,false);assert.equal(failure.reason,'access_denied_1010');
 assert.equal((await probePreflight({fetch:async()=>{throw new Error('timeout');}},origin)).reason,'preflight_network_failed');
 await assert.rejects(()=>probePreflight({},'https://unconfigured.example'));
 for(const [status,data,expected]of [
  [200,{success:true},'provider_accepted'],[200,{success:'true'},'provider_accepted'],
  [200,{success:'false'},'not_accepted'],[503,{success:true},'not_accepted'],
  [200,{success:'true',message:'This form needs activation'},'activation_required'],[200,{},'not_accepted']
 ])assert.equal(assessSubmission(status,data),expected);
 console.log('PASS20 readiness/acceptance checks; all mocked, no email sent');
})().catch(error=>{console.error(error);process.exitCode=1;});
