const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');process.chdir(root);
const original='0770fb2e5cea862df1f1a39a9553c25eb84a2930';
const ctx={window:{}};vm.createContext(ctx);vm.runInContext(fs.readFileSync('birthday-timed-lyrics.js','utf8'),ctx);
const lyrics=ctx.window.BIRTHDAY_TIMED_LYRICS;
assert.equal(lyrics.fourth.length,45);
assert.equal(fs.readFileSync('birthday-timed-lyrics.js','utf8').replace(/\r\n/g,'\n'),execFileSync('git',['show',original+':birthday-timed-lyrics.js'],{encoding:'utf8'}).replace(/\r\n/g,'\n'));
const context={window:{},localStorage:{getItem:()=>null,setItem:()=>{}},WeakMap};vm.createContext(context);vm.runInContext(fs.readFileSync('soundtrack.js','utf8'),context);
const tracks=context.window.YITING_TRACKS;
assert.equal(tracks.map(t=>t.title).join('|'),'열 시 이십 분의 별|너만을 위한 별빛|너라는 별빛|10월의 밤');
assert.equal(tracks.map(t=>t.key).join('|'),'first|fourth|second|third');
for(const track of tracks){assert.ok(fs.existsSync(track.src));assert.ok(fs.existsSync(track.video));}
const files=fs.readdirSync('.').filter(f=>/\.(js|html|css)$/.test(f));let paths=0;
for(const name of files){
 const source=fs.readFileSync(name,'utf8');
 if(name.endsWith('.js'))execFileSync(process.execPath,['--check',name],{stdio:'pipe'});
 for(const match of source.matchAll(/(?:src|href)=["']([^"']+)["']|["'](assets\/[\w()./-]+\.(?:webp|jpg|mp4|m4a|png))["']/g)){
  const target=(match[1]||match[2]).split(/[?#]/)[0];
  if(!target||/^(?:https?:|data:|mailto:|blob:|javascript:)/.test(target)||target==='./'||target.includes('+'))continue;
  assert.ok(fs.existsSync(path.resolve(root,target)),name+': '+target);paths++;
 }
}
const before=execFileSync('git',['ls-tree','-r','--name-only',original],{encoding:'utf8'}).trim().split('\n').filter(f=>f.endsWith('.html'));
for(const page of before)assert.ok(fs.existsSync(page),'Lost page '+page);
console.log(`PASS JS syntax, ${paths} local paths, ${before.length} preserved pages, track order and unchanged 45 fourth-song bilingual cues`);
