(()=>{'use strict';
// Keep the reviewed key-pose artwork intact; interpolate only its whole-body placement.
function sample({phase=0,amount=0,height=0,reduced=false}){
 const weight=reduced||!Number.isFinite(amount)?0:Math.max(0,Math.min(1,amount));
 const angle=(Number.isFinite(phase)?phase:0)*Math.PI*2,size=Number.isFinite(height)?Math.max(0,height):0;
 return {lift:-(Math.sin(angle)**2)*size*.006*weight,lean:(Math.sin(angle)+Math.sin(angle*2)*.2)*.003*weight};
}
window.YitingStride={sample,apply(ctx,state){const pose=sample(state);ctx.translate(0,pose.lift);ctx.rotate(pose.lean);return pose;}};
})();
