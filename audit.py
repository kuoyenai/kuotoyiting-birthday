"""Run `python audit.py` before publishing a new App version. No extra libraries."""
import json,re,struct
from pathlib import Path
r=Path(__file__).resolve().parent
js=(r/'pwa.js').read_text(encoding='utf-8-sig');sw=(r/'sw.js').read_text(encoding='utf-8-sig')
version=re.search(r"const APP_VERSION='([^']+)'",js).group(1)
assert re.search(r"const APP_VERSION='([^']+)'",sw).group(1)==version,'Worker / App version mismatch'
manifest=json.loads((r/'manifest.json').read_text(encoding='utf-8'))
assert manifest['display']=='standalone' and manifest['orientation']=='portrait'
assert manifest['start_url']=='./' and manifest['scope']=='./'
for file in ['app.webmanifest','app-manifest.json']:
 assert json.loads((r/file).read_text(encoding='utf-8'))==manifest,file+' differs'
for page in ['index.html','movie.html','game.html','gift.html','novel-comic.html','starlight.html','install.html']:
 html=(r/page).read_text(encoding='utf-8-sig')
 assert 'name="app-version" content="'+version+'"' in html,page+' version mismatch'
 assert 'href="manifest.json"' in html,page+' manifest mismatch'
 assert 'rel="apple-touch-icon"' in html and 'href="apple-touch-icon.png"' in html,page+' Apple icon mismatch'
 assert 'viewport-fit=cover' in html,page+' missing safe area viewport'
for icon in manifest['icons']:
 data=(r/icon['src'].split('?')[0]).read_bytes()
 assert data[:8]==b'\x89PNG\r\n\x1a\n'
 width,height=struct.unpack('>II',data[16:24]);assert icon['sizes']==f'{width}x{height}'
apple=(r/'apple-touch-icon.png').read_bytes();assert struct.unpack('>II',apple[16:24])==(180,180)
print('PASS App version',version,': manifest, page versions, iOS icon and PNG sizes')
