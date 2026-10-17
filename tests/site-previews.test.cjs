const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, readdirSync, existsSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { resolve } = require('node:path');
const root = resolve(__dirname, '..');
const read = name => readFileSync(resolve(root, name), 'utf8');
const configWindow = {};
runInNewContext(read('config.js'), { window: configWindow });
const config = configWindow.STEADY_HANDS;

function picker(entries = config.customPreviews, href = 'https://steadyhandsop.com/preview.html') {
  const select = { value: '', options: [], append(option) { this.options.push(option); }, addEventListener(type, handler) { this[type] = handler; } };
  const button = { disabled: true };
  const message = { textContent: '' };
  const form = { querySelector: selector => selector === 'select' ? select : button, addEventListener(type, handler) { this[type] = handler; } };
  const navigations = [];
  runInNewContext(read('site-previews.js'), {
    URL,
    window: { STEADY_HANDS: { customPreviews: entries }, location: { href, assign: url => navigations.push(url) } },
    document: { querySelector: selector => selector === '#custom-preview-form' ? form : message, createElement: () => ({}) }
  });
  return { select, button, message, navigations, submit: () => form.submit({ preventDefault() {} }) };
}

test('catalogue covers exactly the published site directories', () => {
  const directories = readdirSync(resolve(root, 'sites'), { withFileTypes: true })
    .filter(entry => entry.isDirectory() && existsSync(resolve(root, 'sites', entry.name, 'index.html')))
    .map(entry => `sites/${entry.name}/`).sort();
  assert.deepEqual(Array.from(config.customPreviews, site => site.path).sort(), directories);
  assert.equal(picker().select.options.length, directories.length);
});

test('each business opens its own site, including on subdirectory hosting', () => {
  for (const site of config.customPreviews) {
    const ui = picker(undefined, 'https://example.com/Steadyhandsop/preview.html');
    assert.equal(ui.button.disabled, true);
    ui.select.value = site.path;
    ui.select.change();
    assert.equal(ui.button.disabled, false);
    ui.submit();
    assert.deepEqual(ui.navigations, [`https://example.com/Steadyhandsop/${site.path}`]);
    assert.equal(ui.select.options.find(option => option.value === site.path).textContent, site.name);
  }
});

test('blank, unknown, and unsafe entries cannot navigate', () => {
  const ui = picker([{ name: 'Unsafe', path: 'javascript:alert(1)' }, { name: 'External', path: 'https://example.com/' }, { name: 'Traversal', path: 'sites/../' }, ...config.customPreviews]);
  assert.equal(ui.select.options.length, config.customPreviews.length);
  for (const value of ['', 'sites/missing/', 'https://example.com/']) {
    ui.select.value = value;
    ui.select.change();
    ui.submit();
    assert.equal(ui.button.disabled, true);
  }
  assert.deepEqual(ui.navigations, []);
});

test('empty catalogue explains why the picker is unavailable', () => {
  const ui = picker([]);
  assert.equal(ui.select.disabled, true);
  assert.equal(ui.button.disabled, true);
  assert.match(ui.message.textContent, /No custom previews/);
});

test('regular code preview still opens an existing code case-insensitively', async () => {
  const source = read('script.js').split('// Dedicated preview page form')[1].split('// GitHub Steadyhandsop phone showcase')[0];
  let submit;
  const navigations = [];
  const form = { addEventListener(type, handler) { submit = handler; } };
  const message = {};
  runInNewContext(source, {
    config, window: {}, console,
    go: url => { navigations.push(url); return true; },
    document: { querySelector: selector => ({ '#preview-page-form': form, '#preview-page-code': { value: ' DEBBYSCREW ' }, '#preview-page-message': message })[selector] }
  });
  await submit({ preventDefault() {} });
  assert.deepEqual(navigations, [config.previews.debbyscrew]);
});
