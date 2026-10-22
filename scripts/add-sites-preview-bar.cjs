#!/usr/bin/env node
'use strict';
// Re-run after adding an HTML page anywhere under sites/. No npm install needed.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

function previewBar(code) {
  const href = 'https://portal.steadyhandsop.com/index.html?preview=' + encodeURIComponent(code);
  return `<!-- steady-sites-preview:bar:start -->
<aside id="sh-site-preview-bar" aria-label="Website preview">
  <span>WEBSITE PREVIEW</span>
  <a href="${href}">Approve preview &amp; continue ↗</a>
</aside>
<script>
(() => {
  const bar = document.getElementById('sh-site-preview-bar');
  // The portal supplies its own approval controls beside an embedded preview.
  if (window.self !== window.top) bar.hidden = true;
  const measure = () => document.documentElement.style.setProperty('--sh-preview-bar-height', bar.getBoundingClientRect().height + 'px');
  measure();
  if (typeof ResizeObserver !== 'undefined') new ResizeObserver(measure).observe(bar);
  else window.addEventListener('resize', measure);
})();
</script>
<!-- steady-sites-preview:bar:end -->`;
}
const style = `<!-- steady-sites-preview:style:start -->
<style>
:root{--sh-preview-bar-height:48px}
#sh-site-preview-bar{box-sizing:border-box;position:sticky;top:0;z-index:1000000;width:100%;margin:0;padding:10px 16px;display:flex;align-items:center;justify-content:center;gap:8px 20px;flex-wrap:wrap;background:#102b4c;color:#fff;text-align:center;font:700 13px/1.4 Arial,sans-serif;letter-spacing:normal;box-shadow:0 2px 10px #0000002e}
#sh-site-preview-bar span{font:inherit;color:inherit}
#sh-site-preview-bar[hidden]{display:none}
#sh-site-preview-bar a{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-height:28px;padding:3px 0;color:#fff!important;background:transparent;font:800 13px/1.4 Arial,sans-serif;text-decoration:underline;text-underline-offset:3px;letter-spacing:normal;text-transform:none;white-space:normal;overflow-wrap:anywhere}
#sh-site-preview-bar a:focus-visible{outline:2px solid #ffbf00;outline-offset:4px;border-radius:2px}
body.sh-custom-preview{padding-top:0!important}
body.sh-custom-preview>.site-header,body.sh-custom-preview>header.topbar,body.sh-custom-preview>header.header{position:sticky!important;top:var(--sh-preview-bar-height)!important}
@media(max-width:480px){#sh-site-preview-bar{padding:8px 12px;gap:0 12px}#sh-site-preview-bar a{min-height:44px}}
</style>
<!-- steady-sites-preview:style:end -->`;

function decorate(html, code) {
  // Replace marked blocks and migrate the older unmarked preview banner.
  // Leave all business content and unrelated styles/scripts intact.
  let result = html.replace(/<!-- steady-sites-preview:(style|bar):start -->[\s\S]*?<!-- steady-sites-preview:\1:end -->\s*/g, '');
  if (!/<body\b/i.test(result) || !/<\/head\s*>/i.test(result)) return html;
  result = result.replace(/<style\b[^>]*\bid\s*=\s*(["'])sh-preview-style\1[^>]*>[\s\S]*?<\/style>\s*/gi, '');
  result = result.replace(/<aside\b[^>]*\bid\s*=\s*(["'])sh-site-preview-bar\1[^>]*>[\s\S]*?<\/aside>\s*(<script\b[^>]*>([\s\S]*?)<\/script>)?/gi,
    (_, quote, script = '', source = '') => /getElementById\(\s*['"]sh-site-preview-bar['"]\s*\)/.test(source) ? '' : script);
  result = result.replace(/<\/head\s*>/i, style + '\n</head>');
  result = result.replace(/<body\b([^>]*)>\s*/i, (_, attrs) => {
    if (/\bclass\s*=/i.test(attrs)) {
      attrs = attrs.replace(/\bclass\s*=\s*(["'])(.*?)\1/i, (_, quote, classes) =>
        'class=' + quote + [...new Set(classes.split(/\s+/).filter(Boolean).concat('sh-custom-preview'))].join(' ') + quote);
    } else attrs += ' class="sh-custom-preview"';
    return '<body' + attrs + '>\n' + previewBar(code) + '\n';
  });
  return result;
}
function htmlFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, {withFileTypes:true}).flatMap(entry => {
    const file = path.join(dir, entry.name);
    return entry.isDirectory() ? htmlFiles(file) : /\.html?$/i.test(entry.name) ? [file] : [];
  });
}
function install(root) {
  const context = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'config.js'), 'utf8'), context);
  const aliases = context.window.STEADY_HANDS?.previews || {};
  let changed = 0;
  for (const file of htmlFiles(path.join(root, 'sites'))) {
    const folder = path.relative(path.join(root, 'sites'), file).split(path.sep)[0];
    const code = Object.entries(aliases).find(([, url]) => {
      try {const u = new URL(url);return u.origin === 'https://steadyhandsop.com' && u.pathname === '/sites/' + folder + '/';} catch {return false;}
    })?.[0] || folder;
    const before = fs.readFileSync(file, 'utf8'), after = decorate(before, code);
    if (after !== before) {fs.writeFileSync(file, after);changed++;}
  }
  return changed;
}
if (require.main === module) console.log('Updated ' + install(path.resolve(__dirname, '..')) + ' site HTML pages.');
module.exports = {decorate, htmlFiles, install};
