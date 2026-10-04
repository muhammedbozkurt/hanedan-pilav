import re, sys, json
SP = '/private/tmp/claude-501/-Users-muhammedbozkurt-Desktop-Others-hanedan-pilav/024b82e3-c623-4249-b3bc-3db25d1aa0a5/scratchpad'
PH = SP + '/yonler_fontpkgs/phosphor-icons-core-2.1.1/package/assets/bold/'
DST = '/Users/muhammedbozkurt/Desktop/Others/hanedan-pilav/_tasarim/sunum/e-esnaf/index.html'
s = open(SP + '/sunumE_work/index.tpl.html', encoding='utf-8').read()

def icon(m):
    name = m.group(1)
    svg = open(PH + name + '-bold.svg').read().strip()
    return svg.replace('<svg xmlns="http://www.w3.org/2000/svg"', '<svg class="ikon" aria-hidden="true" focusable="false"')

s = re.sub(r'\{\{I:([a-z\-]+)\}\}', icon, s)
wa = open(SP + '/sunumE_pkgs/package/icons/whatsapp.svg').read()
wa_path = re.search(r'<path d="([^"]+)"', wa).group(1)
s = s.replace('{{WA}}', f'<svg class="wa-glif" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="currentColor"><path d="{wa_path}"/></svg>')
ok = open(PH + 'arrow-right-bold.svg').read().strip().replace('fill="currentColor"', 'fill="#000"')
from urllib.parse import quote
s = s.replace('{{OKURL}}', 'url("data:image/svg+xml,' + quote(ok, safe=' =:/,"') .replace('"', "'") + '")')
s = s.replace('{{MAP}}', open(SP + '/sunumE_work/map.svg').read())
assert '{{' not in s, re.findall(r'\{\{[^}]+\}\}', s)
bad = [c for c in ('—', '–') if c in s]
assert not bad, 'dash found'
open(DST, 'w', encoding='utf-8').write(s)
print('ok', DST, len(s))
