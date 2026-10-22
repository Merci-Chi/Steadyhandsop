'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {decorate, htmlFiles, install} = require('../scripts/add-sites-preview-bar.cjs');
const root = path.resolve(__dirname, '..');

test('every custom HTML page has one working portal link for its own preview', () => {
  const context = {window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(root, 'config.js'), 'utf8'), context);
  const aliases = context.window.STEADY_HANDS.previews;
  const files = htmlFiles(path.join(root, 'sites'));
  assert.ok(files.length >= 11);
  for (const file of files) {
    const html = fs.readFileSync(file, 'utf8');
    const folder = path.relative(path.join(root, 'sites'), file).split(path.sep)[0];
    assert.equal((html.match(/id="sh-site-preview-bar"/g) || []).length, 1, file);
    const href = html.match(/<a href="(https:\/\/portal\.steadyhandsop\.com\/index\.html\?preview=[^"]+)">Approve preview/)[1];
    const url = new URL(href), code = url.searchParams.get('preview');
    assert.equal(new URL(aliases[code]).pathname, '/sites/' + folder + '/', file);
    assert.match(html, /a:focus-visible/);
    assert.match(html, /min-height:44px/);
    assert.match(html, /window.self !== window.top/);
  }
  assert.equal(install(root), 0, 'a repeated run must not rewrite existing files');
});
test('new pages retain their content, scripts, and body attributes', () => {
  const source = '<!doctype html><html><head><title>Example</title></head><body class="menu dark" data-test="kept"><main><h1>Original</h1></main><script src="app.js"></script></body></html>';
  const result = decorate(source, 'new-site');
  assert.match(result, /class="menu dark sh-custom-preview" data-test="kept"/);
  assert.ok(result.includes('<main><h1>Original</h1></main><script src="app.js"></script>'));
  assert.ok(result.indexOf('id="sh-site-preview-bar"') < result.indexOf('<main>'));
  assert.equal(decorate(result, 'new-site'), result);
  assert.equal(decorate('<p>HTML fragment</p>', 'new-site'), '<p>HTML fragment</p>');
});
test('embedded previews hide the outer checkout link and measure zero height', () => {
  for (const embedded of [false, true]) {
    const bar = {hidden:false,getBoundingClientRect(){return {height:this.hidden?0:48};}};
    const heights = [];
    const frame = {}, top = embedded ? {} : frame;
    const html = decorate('<html><head></head><body></body></html>', 'example');
    const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
    vm.runInNewContext(script, {window:{self:frame,top,addEventListener(){}},document:{getElementById:()=>bar,documentElement:{style:{setProperty:(_,height)=>heights.push(height)}}}});
    assert.equal(bar.hidden, embedded);
    assert.equal(heights[0], embedded?'0px':'48px');
  }
});


test('legacy preview banners migrate once without removing business content', () => {
  const original = '<html><head><style id="business-style">body{color:gold}</style><style id="sh-preview-style">#sh-site-preview-bar{color:white}</style></head><body><aside id="sh-site-preview-bar"><a href="https://portal.steadyhandsop.com/index.html?preview=old">Approve preview</a></aside><script>(function(){var bar=document.getElementById(\'sh-site-preview-bar\');bar.hidden=false;})();</script><main>Business content</main><script src="business.js"></script></body></html>';
  for (const source of [original, decorate('<html><head></head><body></body></html>', 'old').replace('</body>', original.match(/<aside[\s\S]*?<\/script>/)[0] + '</body>')]) {
    const result = decorate(source, 'ankajewelry');
    assert.equal((result.match(/id="sh-site-preview-bar"/g) || []).length, 1);
    assert.ok(!result.includes('id="sh-preview-style"'));
    assert.ok(!result.includes('preview=old'));
    assert.ok(result.includes('preview=ankajewelry'));
    assert.equal(decorate(result, 'ankajewelry'), result);
  }
  const result = decorate(original, 'ankajewelry');
  assert.ok(result.includes('<style id="business-style">body{color:gold}</style>'));
  assert.ok(result.includes('<main>Business content</main><script src="business.js"></script>'));
});

test('legacy cleanup preserves unrelated scripts after the banner', () => {
  const source = '<html><head></head><body><aside id="sh-site-preview-bar">WEBSITE PREVIEW</aside><script>window.business = true;</script><main>Content</main></body></html>';
  const result = decorate(source, 'ankajewelry');
  assert.ok(result.includes('<script>window.business = true;</script><main>Content</main>'));
  assert.equal((result.match(/id="sh-site-preview-bar"/g) || []).length, 1);
});
