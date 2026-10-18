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
