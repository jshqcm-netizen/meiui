"""Read-only checks for the exported site; does not claim browser coverage."""
from pathlib import Path
from html.parser import HTMLParser
from urllib.parse import urlsplit, unquote
import re
root=Path('out')
assert root.is_dir(), 'Run npm run build first'
class Page(HTMLParser):
 def __init__(self): super().__init__(); self.links=[];self.assets=[];self.ids=set();self.videos=0
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id' in a:self.ids.add(a['id'])
  if tag=='a' and a.get('href'):self.links.append(a['href'])
  if tag in ['script','img','source','track'] and a.get('src'):self.assets.append(a['src'])
  if tag=='link' and a.get('href'):self.assets.append(a['href'])
  if tag=='video':
   self.videos+=1
   if a.get('poster'):self.assets.append(a['poster'])
pages=list(root.rglob('*.html'));errors=[];link_count=0;video_count=0
for file in pages:
 parser=Page();html=file.read_text();parser.feed(html);video_count+=parser.videos
 for href in parser.links+parser.assets:
  if not href.startswith(('/', '#')) or href.startswith('//'):continue
  link_count+=1;parts=urlsplit(href)
  if not parts.path:
   if parts.fragment and unquote(parts.fragment) not in parser.ids:errors.append(f'{file}: missing anchor {href}')
   continue
  target=root/unquote(parts.path.lstrip('/'))
  if target.is_dir():target=target/'index.html'
  if not target.exists():errors.append(f'{file}: missing target {href}')
 if re.search(r'(sk-[A-Za-z0-9]{30,}|ghp_[A-Za-z0-9]{30,}|-----BEGIN (RSA )?PRIVATE KEY-----)',html):errors.append(f'{file}: possible secret')
assert not errors, '\n'.join(errors)
print(f'PASS: {len(pages)} HTML pages, {link_count} local links/assets, {video_count} video embed(s); no missing local targets, anchors, or obvious secret patterns.')

# Initial HTML remains useful before JavaScript loads; no planned subdomain is linked as a live app.
for kind, card_class in [('blog', 'article-card'), ('docs', 'doc-card')]:
 html=(root/kind/'index.html').read_text()
 assert card_class in html, f'{kind}: missing server-rendered collection fallback'
 parser=Page();parser.feed(html)
 expected=[f'/{kind}/{file.stem}/' for file in Path('content',kind).glob('*.md') if 'status: published' in file.read_text()]
 assert all(href in parser.links for href in expected), f'{kind}: public entries missing in initial HTML'
for path in ['index.html','apps/index.html','blog/index.html','docs/index.html']:
 html=(root/path).read_text()
 assert '浅色主题' in html and '深色主题' in html, f'{path}: named theme controls missing'
parser=Page();parser.feed((root/'apps/index.html').read_text())
assert not any(urlsplit(link).hostname in ['ai.qcm.dev','agents.qcm.dev','admin.qcm.dev'] for link in parser.links), 'Planned domain linked as live'
assert all(f'/apps/{slug}/' in parser.links for slug in ['ai','agents','admin']), 'Missing local planning destination'
assert (root/'media/frosted-studio.webp').is_file(), 'Missing original glass backdrop'
print('PASS: server-rendered collection destinations, named appearance controls, local-only app planning links, and backdrop asset.')
