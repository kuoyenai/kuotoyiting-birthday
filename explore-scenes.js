(()=>{'use strict';
const city={id:'city',label:'TERRA / OCTOBER 20',source:'assets/explore-city-v1.png',color:'purple',hint:'沿著街燈，發現今晚的第一道訊息。'};
const arrival={id:'asterum',label:'ASTERUM / WELCOME HOME',source:'assets/explore-asterum-v1.png',color:'purple',hint:'走進另一個世界，讓熟悉的聲音帶路。'};
const garden={id:'garden',label:'YEJUN / THE MUSIC GARDEN',source:'assets/explore-garden-v1.png',color:'blue',hint:'穿過花園，跟著藝俊的旋律尋找希望。'};
const greenhouse={id:'greenhouse',label:'NOAH / A MOMENT TO REST',source:'assets/explore-greenhouse-v1.png',color:'purple',hint:'放慢腳步，走進諾亞的月光溫室。'};
window.yitingExploreScene=story=>{
 if(!story||story.chapter<3)return city;
 if(story.chapter===9)return {...city,label:'TERRA / THE LIGHT STAYS WITH YOU',hint:'帶著掌心的紅色星星，走回熟悉的日常。'};
 if(story.chapter===8)return {...arrival,id:'farewell',source:'assets/explore-farewell-v1.png',label:'ASTERUM / UNTIL WE MEET AGAIN',color:'red',hint:'走向回程的星光，把最後的叮嚀留在心裡。'};
 if(story.chapter===4){const panel=story.sourcePanel??story.panel;if(panel<6)return garden;if(panel<11)return greenhouse;if(panel<17)return {...arrival,id:'plaza',source:'assets/explore-plaza-v1.png',label:'BAMBY / FIND YOUR JOY',color:'pink',hint:'踩亮粉色地板，跟著斑比找回自在的快樂。'};return {...arrival,id:'observatory',source:'assets/explore-observatory-v1.png',label:'HAMIN / A LITTLE COURAGE',color:'green',hint:'走向河玟，看見微小卻堅定的光。'};}
 if(story.chapter===5)return {...arrival,id:'eunho',source:'assets/explore-eunho-bridge-v1.png',label:'EUNHO / ALWAYS BY YOUR SIDE',color:'red',hint:'沿著紅色微光，走向銀虎留給妳的陪伴。'};
 if(story.chapter===7)return {...arrival,id:'wish',source:'assets/explore-birthday-wish-v1.png',label:'ONLY FOR YITING / A SECRET WISH',color:'gold',hint:'在溫暖的燭光裡，留一個只屬於妳的願望。'};
 if(story.chapter===6)return {...arrival,id:'birthday',source:'assets/explore-birthday-stage-v1.png',label:'ONLY FOR YITING / THE BIRTHDAY NIGHT',color:'gold',hint:'走向只為妳亮起的舞台，收藏今晚的祝福。'};
 return arrival;
};
})();
