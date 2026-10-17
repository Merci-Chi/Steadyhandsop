"""Generate icons and static SEO markup, then package a deployable dist directory."""
import argparse
import hashlib
import html
import json
from pathlib import Path
import re
import shutil
import time
from urllib.parse import urlparse
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parents[1]

def write(path, value):
    path.parent.mkdir(parents=True, exist_ok=True)
    if isinstance(value, str):
        path.write_text(value, encoding='utf-8')
    else:
        path.write_bytes(value)

def prepare():
    config = json.loads((ROOT / 'site.config.json').read_text())
    base = config['url'].strip().rstrip('/')
    if base and (urlparse(base).scheme != 'https' or not urlparse(base).netloc or urlparse(base).query or urlparse(base).fragment):
        raise ValueError('url must be a public HTTPS site URL without query or fragment')
    source = ImageOps.exif_transpose(Image.open(ROOT / config['logo'])).convert('RGB')
    crop = config.get('logo_crop')
    if crop:
        if not (0 <= crop[0] < crop[2] <= source.width and 0 <= crop[1] < crop[3] <= source.height):
            raise ValueError('logo_crop must be within the source image; set null for a new square logo')
        source = source.crop(tuple(crop))
    icons = ROOT / 'assets/images/app'
    icons.mkdir(parents=True, exist_ok=True)
    def icon(size, padding=0.02):
        canvas = Image.new('RGB', (size, size), '#000000')
        artwork = ImageOps.contain(source, (max(1, round(size*(1-2*padding))),)*2, Image.Resampling.LANCZOS)
        canvas.paste(artwork, ((size-artwork.width)//2, (size-artwork.height)//2))
        return canvas
    for size in (16, 32, 48, 96, 144, 152, 167, 180, 192, 256, 512):
        icon(size).save(icons / f'icon-{size}.png', optimize=True)
    for size in (192, 512):
        icon(size, .22).save(icons / f'maskable-{size}.png', optimize=True)
    icon(256).save(ROOT / 'favicon.ico', sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])
    icon(180).save(ROOT / 'apple-touch-icon.png', optimize=True)
    icon(512).save(icons / 'logo.png', optimize=True)
    # Keep the legacy path valid for bookmarks that already refer to it.
    import base64
    data = base64.b64encode((icons/'icon-512.png').read_bytes()).decode()
    write(ROOT/'assets/images/favicon.svg', f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><image width="512" height="512" href="data:image/png;base64,{data}"/></svg>')
    card = Image.new('RGB', (1200,630), '#050505')
    card.paste(icon(580), (310,25))
    card.save(icons/'social.jpg', quality=92, optimize=True)
    revision = hashlib.sha256((icons/'icon-512.png').read_bytes()).hexdigest()[:12]
    manifest = {
        'id':'./', 'name':config['name'], 'short_name':'El Jefe', 'lang':'en',
        'description':'Tacos, birria, and the full El Jefe de Jalisco menu in Memphis.',
        'start_url':'./index.html', 'scope':'./', 'display':'standalone',
        'background_color':config['theme_color'], 'theme_color':config['theme_color'],
        'icons':[{'src':f'assets/images/app/{prefix}-{size}.png?v={revision}', 'sizes':f'{size}x{size}', 'type':'image/png', 'purpose':purpose}
                 for prefix,purpose in [('icon','any'),('maskable','maskable')] for size in (192,512)],
        'shortcuts':[{'name':'View the menu','url':'./menu.html'}]
    }
    write(ROOT/'site.webmanifest', json.dumps(manifest, indent=2)+'\n')
    def absolute(path):
        return base+'/'+path if base else path
    def meta(name, content, attr='name'):
        return f'<meta {attr}="{name}" content="{html.escape(content, quote=True)}">'
    restaurant = {
        '@type':'Restaurant','name':'Taqueria y Birrieria El Jefe de Jalisco',
        'alternateName':config['name'], 'telephone':'+1-901-347-7406',
        'servesCuisine':'Mexican',
        'address':{'@type':'PostalAddress','streetAddress':'1308 Getwell Rd','addressLocality':'Memphis','addressRegion':'TN','postalCode':'38111','addressCountry':'US'},
        'openingHoursSpecification':[{'@type':'OpeningHoursSpecification','dayOfWeek':['Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],'opens':'09:00','closes':'21:30'}]
    }
    if base:
        restaurant.update({'@id':base+'/#restaurant','url':base+'/', 'logo':absolute('assets/images/app/logo.png'),'image':absolute('assets/images/app/social.jpg'),'hasMenu':absolute('menu.html')})
    for page in ('index.html','menu.html'):
        path=ROOT/page
        text=path.read_text()
        menu=page=='menu.html'
        title=('Menu | El Jefe de Jalisco | Memphis Tacos & Birria' if menu else 'El Jefe de Jalisco | Tacos & Birria in Memphis, TN')
        description=('Explore the El Jefe de Jalisco menu: quesabirria, street tacos, burritos, plates and drinks. Visit 1308 Getwell Rd in Memphis or call (901) 347-7406.' if menu else 'Tacos, quesabirria and Mexican favorites at El Jefe de Jalisco. View the menu and visit 1308 Getwell Rd, Memphis, TN. Call (901) 347-7406.')
        tags=['<!-- Generated by tools/prepare.py; edit site.config.json and rebuild. -->','<meta charset="UTF-8">','<meta name="viewport" content="width=device-width,initial-scale=1,minimum-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">',meta('theme-color',config['theme_color']),meta('color-scheme','dark'),meta('description',description),meta('robots','index,follow,max-image-preview:large'),f'<title>{html.escape(title)}</title>',
              '<link rel="icon" href="favicon.ico" sizes="16x16 32x32 48x48 64x64 128x128 256x256">',
              '<link rel="icon" href="assets/images/app/icon-96.png" sizes="96x96" type="image/png">',
              f'<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png?v={revision}">',
              f'<link rel="manifest" href="site.webmanifest?v={revision}">',
              meta('apple-mobile-web-app-title','El Jefe'), meta('apple-mobile-web-app-capable','yes'),meta('apple-mobile-web-app-status-bar-style','black-translucent'),
              meta('og:type','website','property'),meta('og:locale','en_US','property'),meta('og:site_name',config['name'],'property'),meta('og:title',title,'property'),meta('og:description',description,'property'),meta('og:image',absolute('assets/images/app/social.jpg'),'property'),meta('og:image:width','1200','property'),meta('og:image:height','630','property'),meta('og:image:alt','El Jefe de Jalisco restaurant logo','property'),meta('twitter:card','summary_large_image'),meta('twitter:title',title),meta('twitter:description',description),meta('twitter:image',absolute('assets/images/app/social.jpg'))]
        graph=[restaurant]
        if base:
            url=base+'/' if not menu else absolute(page)
            tags += [f'<link rel="canonical" href="{html.escape(url, quote=True)}">',meta('og:url',url,'property')]
            graph += [{'@type':'WebSite','@id':base+'/#website','url':base+'/', 'name':config['name'],'alternateName':'Taqueria y Birrieria El Jefe de Jalisco'}]
        tags += ['<script type="application/ld+json">'+json.dumps({'@context':'https://schema.org','@graph':graph}).replace('<','\\u003c')+'</script>']
        for file in ('css.css','content.js','js.js'):
            version=hashlib.sha256((ROOT/file).read_bytes()).hexdigest()[:12]
            tags.append(f'<link rel="stylesheet" href="{file}?v={version}">' if file.endswith('.css') else f'<script defer src="{file}?v={version}"></script>')
        text=re.sub(r'<head>.*?</head>', '<head>\n'+'\n'.join(tags)+'\n</head>', text, flags=re.S)
        text=text.replace('src="assets/images/logo.jpg"','src="assets/images/app/logo.png"')
        if menu:
            text=text.replace('<h2>MEET THE <em>MENU.</em></h2>','<h1 class="menu-title">MEET THE <em>MENU.</em></h1>')
        write(path,text)
    robots='User-agent: *\nAllow: /\n'
    if base:
        robots+='Sitemap: '+base+'/sitemap.xml\n'
        from xml.sax.saxutils import escape
        write(ROOT/'sitemap.xml','<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+''.join('<url><loc>'+escape(url)+'</loc></url>' for url in (base+'/',absolute('menu.html')))+'</urlset>\n')
    elif (ROOT/'sitemap.xml').exists():
        (ROOT/'sitemap.xml').unlink()
    write(ROOT/'robots.txt',robots)
    # Hosts supporting _headers will revalidate stable URLs before reusing cached files.
    write(ROOT/'_headers','/*\n  Cache-Control: public, max-age=0, must-revalidate\n  X-Content-Type-Options: nosniff\n')
    dist=ROOT/'dist'
    if dist.exists(): shutil.rmtree(dist)
    dist.mkdir()
    for name in ['index.html','menu.html','css.css','content.js','js.js','motion.js','favicon.ico','apple-touch-icon.png','site.webmanifest','robots.txt','_headers','sitemap.xml']:
        if (ROOT/name).exists(): shutil.copy2(ROOT/name,dist/name)
    shutil.copytree(ROOT/'assets',dist/'assets')
    print('Prepared icons, metadata, and dist/.'+(' Domain metadata enabled.' if base else ' Set url in site.config.json for canonical URLs, absolute share images, and sitemap.'))

def signature():
    paths=[ROOT/'site.config.json']+[ROOT/p for p in ['index.html','menu.html','css.css','content.js','js.js','motion.js']]+list((ROOT/'assets').rglob('*'))
    return tuple((str(p), p.stat().st_mtime_ns, p.stat().st_size) for p in paths if p.is_file())

if __name__=='__main__':
    parser=argparse.ArgumentParser();parser.add_argument('--watch',action='store_true');args=parser.parse_args()
    prepare()
    if args.watch:
        print('Watching site files and logo; Ctrl+C to stop.',flush=True)
        previous=signature()
        try:
            while True:
                time.sleep(1)
                current=signature()
                if current!=previous:
                    try: prepare()
                    except Exception as error: print('Build failed:',error,flush=True)
                    previous=signature()
        except KeyboardInterrupt: pass
