const fs=require('fs'),vm=require('vm'),assert=require('assert');
(async()=>{
 let now=1000,observe;const pending=[];const canvas={dataset:{scene:'birthday'}},window={};
 class Image{decode(){return new Promise(resolve=>pending.push(resolve));}removeAttribute(){}}
 const c={window,document:{getElementById:()=>canvas},Image,performance:{now:()=>now},MutationObserver:class{constructor(fn){observe=fn;}observe(){}}};
 vm.createContext(c);vm.runInContext(fs.readFileSync('explore-actors.js','utf8'),c);
 window.YitingActors.configure([{member:'concert',scene:'birthday',x:100,ground:.69}]);
 pending.shift()();await Promise.resolve();await Promise.resolve();
 let draws=[],stack=[];const ctx={globalAlpha:1,save(){stack.push(this.globalAlpha);},restore(){this.globalAlpha=stack.pop();},createRadialGradient(){return{addColorStop(){}};},translate(){},scale(){},beginPath(){},arc(){},fill(){},drawImage(...a){draws.push({alpha:this.globalAlpha,args:a.slice(1)});}};
 function draw(t,reduced=false){draws=[];window.YitingActors.draw(ctx,{id:'birthday',w:390,h:540,camera:0,scale:1,t,reduced});assert.equal(ctx.globalAlpha,1,'opacity leaks to player/foreground');return draws[0];}
 assert.equal(draw(1000).alpha,0);assert.equal(draw(1325).alpha,.5);assert.equal(draw(1650).alpha,1);assert.equal(draw(1000,true).alpha,1);
 assert.deepEqual(draw(1000).args,draw(1650).args,'fade moves or crops characters');
 now=2000;canvas.dataset.scene='wish';observe();assert.equal(window.YitingActors.cachedActors,0);canvas.dataset.scene='birthday';observe();pending.shift()();await Promise.resolve();await Promise.resolve();assert.equal(draw(2000).alpha,0);assert.equal(draw(2650).alpha,1);
 console.log('PASS 650ms smooth entrance / static reduced motion / fixed silhouette / alpha restored / physical reentry restarts');
})().catch(e=>{console.error(e);process.exitCode=1;});
