const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const root = resolve(__dirname, '../sites/eljefedejalisco');
const read = name => readFileSync(resolve(root, name), 'utf8');

function setup(options = {}) {
  class Element {
    constructor() { this.children = []; this.handlers = {}; this.attrs = {}; this.dataset = {}; this.value = ''; this.open = false; this.vars = new Map(); this.style = { setProperty: (k, v) => this.vars.set(k, v), getPropertyValue: k => this.vars.get(k) || '' }; }
    append(...nodes) { this.children.push(...nodes); }
    replaceChildren(...nodes) { this.children = nodes; }
    addEventListener(type, handler) { this.handlers[type] = handler; }
    setAttribute(k, v) { this.attrs[k] = v; }
    getBoundingClientRect() { return { top: 30, bottom: 80, left: 10, right: 350, width: 340, height: 50 }; }
    focus() { document.activeElement = this; }
    showModal() { this.open = true; }
    close() { this.open = false; this.handlers.close?.(); }
    querySelectorAll() { return this.children.filter(n => n.tag === 'button'); }
  }
  const trigger = new Element(), panel = new Element(), search = new Element(), list = new Element(), close = new Element(), status = new Element(), host = new Element(), html = new Element(), body = new Element(), head = new Element();
  trigger.dataset.sourceUrl = 'https://steadyhandsop.com/sites/eljefedejalisco/menu.html';
  panel.querySelector = selector => ({ input: search, '.language-options': list, '.language-close': close })[selector];
  const frames = [], observers = [], animations = [], navigations = [], saved = new Map(options.saved || []);
  const document = {
    activeElement: null, body, head, documentElement: html, cookie: '',
    createElement(tag) { const el = new Element(); el.tag = tag; return el; },
    querySelector(selector) { return ({ '#translate-toggle': trigger, '#language-dialog': panel, '#translation-status': status, '#google-translate-provider': host })[selector] || null; },
    querySelectorAll() { return frames; }
  };
  const window = { location: { assign: url => navigations.push(url) }, addEventListener() {} };
  runInNewContext(read('translation-languages.js'), { window });
  runInNewContext(read('translation.js'), {
    window, document, URL, URLSearchParams, Intl, Event: class {},
    localStorage: { getItem: key => saved.get(key), setItem: (key, value) => saved.set(key, value) },
    location: { search: options.search || '', hostname: 'steadyhandsop.com' },
    innerHeight: 800, innerWidth: 390,
    MutationObserver: class { constructor(fn) { observers.push(fn); } observe() {} disconnect() {} },
    setTimeout: () => 1, clearTimeout() {},
    requestAnimationFrame: fn => { animations.push(fn); return animations.length; },
    getComputedStyle: () => ({ visibility: 'visible' })
  });
  return { document, trigger, panel, search, list, head, html, frames, saved, navigations, observers, window,
    open: () => trigger.handlers.click(),
    flush: () => { while (animations.length) animations.shift()(); },
    buttons: () => list.children.filter(n => n.tag === 'button') };
}

test('custom picker starts with English, Spanish, then the remaining top-ten languages', () => {
  const ui = setup(); ui.open();
  assert.deepEqual(ui.buttons().slice(0, 10).map(n => n.dataset.language), ['en', 'es', 'zh-CN', 'hi', 'ar', 'fr', 'bn', 'pt', 'ru', 'ur']);
  assert.ok(ui.buttons().length >= 194);
  const rest = ui.buttons().slice(10).map(n => n.children[0].textContent);
  assert.deepEqual(rest, [...rest].sort((a, b) => a.localeCompare(b, 'en')));
  assert.equal(ui.trigger.attrs['aria-expanded'], 'true');
});

test('language search supports Spanish native label and reports no matches', () => {
  const ui = setup(); ui.open();
  ui.search.value = 'Español'; ui.search.handlers.input();
  assert.deepEqual(ui.buttons().map(n => n.dataset.language), ['es']);
  ui.search.value = 'not-a-language'; ui.search.handlers.input();
  assert.equal(ui.buttons().length, 0);
  assert.match(ui.list.children[0].textContent, /No languages/);
});

test('failed widget loads fall back to Google translation of the exact selected page', async () => {
  const ui = setup(); ui.open();
  const pending = ui.buttons().find(n => n.dataset.language === 'es').handlers.click();
  ui.head.children[0].handlers.error();
  await pending;
  const url = new URL(ui.navigations[0]);
  assert.equal(url.origin, 'https://translate.google.com');
  assert.equal(url.searchParams.get('tl'), 'es');
  assert.equal(url.searchParams.get('u'), ui.trigger.dataset.sourceUrl);
  assert.equal(ui.panel.open, false);
});

test('English restoration returns to the original page and clears saved preference', async () => {
  const ui = setup(); ui.open();
  await ui.buttons()[0].handlers.click();
  assert.equal(new URL(ui.navigations[0]).searchParams.get('lang'), 'en');
  const restored = setup({ search: '?lang=en', saved: [['el-jefe-language', 'es']] });
  assert.equal(restored.saved.get('el-jefe-language'), 'en');
  assert.equal(restored.head.children.length, 0);
});

test('visible Google toolbar reserves its height and releases space when hidden', () => {
  const ui = setup();
  const frame = { getBoundingClientRect: () => ({ top: 0, bottom: 44, width: 390, height: 44 }) };
  ui.frames.push(frame); ui.flush();
  assert.equal(ui.html.vars.get('--google-bar-height'), '44px');
  ui.frames.length = 0; ui.observers.at(-1)(); ui.flush();
  assert.equal(ui.html.vars.get('--google-bar-height'), '0px');
});

test('both source and dist pages put Translate directly after Menu and load the picker scripts', () => {
  for (const prefix of ['', 'dist/']) for (const page of ['index.html', 'menu.html']) {
    const html = read(prefix + page);
    assert.match(html, /<div class="header-controls"><button class="nav-toggle"[^]*?<\/button><button id="translate-toggle"/);
    assert.ok(html.includes('translation-languages.js?v='));
    assert.ok(html.includes('translation.js?v='));
    const panel = html.split('<dialog id="language-dialog"')[1];
    assert.ok(panel && !panel.split('</dialog>')[0].includes('<select'));
  }
});


test('available Google widget receives the selected language without navigating away', async () => {
  const ui = setup(); ui.open();
  let changes = 0;
  const combo = { options: [{ value: '', textContent: 'Select' }, { value: 'es', textContent: 'Spanish' }], dispatchEvent() { changes++; } };
  const originalQuery = ui.document.querySelector;
  ui.document.querySelector = selector => selector.includes('.goog-te-combo') ? combo : originalQuery(selector);
  ui.window.google = { translate: { TranslateElement: function () {} } };
  const pending = ui.buttons().find(button => button.dataset.language === 'es').handlers.click();
  ui.window.elJefeGoogleTranslateReady();
  await pending;
  assert.equal(combo.value, 'es');
  assert.equal(changes, 1);
  assert.equal(ui.navigations.length, 0);
});
