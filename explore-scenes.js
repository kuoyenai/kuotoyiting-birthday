(()=>{'use strict';
const city={id:'city',label:'TERRA / OCTOBER 20',source:'assets/explore-city-v1.png',color:'purple',hint:'沿著街燈，發現今晚的第一道訊息。'};
const arrival={id:'asterum',label:'ASTERUM / WELCOME HOME',source:'assets/explore-asterum-v1.png',color:'purple',hint:'走進另一個世界，讓熟悉的聲音帶路。'};
const garden={id:'garden',label:'YEJUN / THE MUSIC GARDEN',source:'assets/explore-garden-v1.png',color:'blue',hint:'穿過花園，跟著藝俊的旋律尋找希望。'};
const greenhouse={id:'greenhouse',label:'NOAH / A MOMENT TO REST',source:'assets/explore-greenhouse-v1.png',color:'purple',hint:'放慢腳步，走進諾亞的月光溫室。'};
window.yitingExploreScene=story=>{
 if(!story||story.chapter<3||story.chapter===9)return city;
 if(story.chapter===4){const panel=story.sourcePanel??story.panel;if(panel<6)return garden;if(panel<11)return greenhouse;return {...arrival,id:panel<17?'plaza':'observatory',label:panel<17?'BAMBY / FIND YOUR JOY':'HAMIN / A LITTLE COURAGE',color:panel<17?'pink':'green',hint:panel<17?'跟著斑比的腳步，找回自在的快樂。':'走向河玟，看見微小卻堅定的光。'};}
 if(story.chapter===5)return {...arrival,id:'eunho',label:'EUNHO / ALWAYS BY YOUR SIDE',color:'red',hint:'沿著紅色微光，走向銀虎留給妳的陪伴。'};
 if(story.chapter===6||story.chapter===7)return {...arrival,id:'birthday',label:'ONLY FOR YITING / THE BIRTHDAY NIGHT',color:'gold',hint:'走向只為妳亮起的舞台，收藏今晚的祝福。'};
 return arrival;
};
})();
