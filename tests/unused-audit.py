import pathlib,subprocess,json,re
root=pathlib.Path(__file__).resolve().parents[1]
tracked=subprocess.check_output(['git','ls-files'],cwd=root,text=True).splitlines()
code=[p for p in tracked if pathlib.Path(p).suffix in {'.html','.js','.css','.json','.webmanifest','.vtt'} and not p.startswith('tests/')]
texts={p:(root/p).read_text(encoding='utf-8-sig') for p in code}
roots=[p for p in code if p.endswith('.html')]+['sw.js','manifest.json','app.webmanifest','app-manifest.json','vercel.json']
seen=set(roots);queue=list(roots)
while queue:
 p=queue.pop();t=texts.get(p,'')
 for q in code:
  if q not in seen and (q in t or './'+q in t):seen.add(q);queue.append(q)
combined='\n'.join(texts.get(p,'') for p in seen)
unusedcode=[p for p in code if pathlib.Path(p).suffix in {'.js','.css'} and p not in seen]
candidates=[]
for p in tracked:
 if pathlib.Path(p).suffix.lower() not in {'.png','.jpg','.jpeg','.webp','.mp4','.m4a','.woff2','.svg','.zip'}:continue
 stem=pathlib.Path(p).stem
 if p not in combined and stem not in combined:
  candidates.append({'path':p,'bytes':(root/p).stat().st_size})
result={'method':'Conservative static graph: all retained HTML entry points, manifest variants and service worker; dynamic asset stems protected. Candidates require manual review; no deletion.','unreachableCode':unusedcode,'unreferencedMediaCandidates':candidates,'candidateMediaBytes':sum(x['bytes'] for x in candidates)}
(root/'unused-audit.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps(result,ensure_ascii=False,indent=2))
