(()=>{
 if(window.top!==window.self)return;
 const page=location.pathname.split('/').pop()||'index.html',query=new URLSearchParams(location.search);
 // Preserve old invitation links while keeping the film outside the companion-audio shell.
 if(page==='index.html'&&query.get('gift')!=='1'&&query.has('chapter')){location.replace('movie.html?'+query.toString()+location.hash);return;}
 if(['index.html','game.html','novel-comic.html','gift.html','starlight.html'].includes(page))location.replace('music-shell.html?view='+encodeURIComponent(page+location.search+location.hash));
})();
