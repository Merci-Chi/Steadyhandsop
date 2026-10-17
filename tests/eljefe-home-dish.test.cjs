const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const root = resolve(__dirname, '../sites/eljefedejalisco');
const read = file => readFileSync(resolve(root, file), 'utf8');
const window = {};
runInNewContext(read('content.js'), { window });
const all = window.EL_JEFE.menu.flatMap(category => category.items);
const slug = item => item.image.split('/').pop().replace(/-\d+\.[^.]+$/, '');
const source = read('js.js').split('// Homepage dish links: paint the menu before dropping in the requested popup.')[1].split('    openLinkedProduct();')[0];

function arrival(query) {
  const frames = [], timers = [], opened = [];
  const cards = all.map((item, index) => ({ dataset: { productIndex: String(index) }, link: { index } }));
  const context = {
    all, cards, productOpenVersion: 0, URLSearchParams,
    location: { search: query },
    document: { querySelector: () => null },
    photosFor: item => item.photos?.length ? item.photos : [item.image],
    $: (selector, card) => card.link,
    openProduct: (...args) => opened.push(args),
    requestAnimationFrame: fn => frames.push(fn),
    setTimeout: (fn, delay) => timers.push({ fn, delay })
  };
  runInNewContext(source + '\nopenLinkedProduct();', context);
  return { context, frames, timers, opened, flush() {
    while (frames.length) frames.shift()();
    while (timers.length) timers.shift().fn();
  } };
}

test('all nine homepage dish cards link to the matching menu record and pictured photo', () => {
  assert.equal(new Set(all.map(slug)).size, all.length);
  for (const prefix of ['', 'dist/']) {
    const html = read(prefix + 'index.html');
    const anchors = [...html.matchAll(/<a\b[^>]*>[^]*?<\/a>/g)].map(match => match[0])
      .filter(anchor => /class="[^"]*(?:menu-preview-card|editorial-photo)/.test(anchor));
    assert.equal(anchors.length, 9);
    for (const anchor of anchors) {
      const href = anchor.match(/href="([^"]+)"/)[1].replaceAll('&amp;', '&');
      const image = anchor.match(/<img[^>]+src="([^"]+)"/)[1];
      const url = new URL(href, 'https://steadyhandsop.com/sites/eljefedejalisco/');
      const item = all.find(item => slug(item) === url.searchParams.get('dish'));
      assert.ok(item, href);
      assert.equal(item.photos[Number(url.searchParams.get('photo'))], image);
    }
    assert.match(html, /href="menu.html">VIEW THE FULL MENU/);
  }
});

test('linked dish waits for menu paint and then opens the exact photo with animation', () => {
  const ui = arrival('?dish=street-tacos&photo=3');
  assert.equal(ui.opened.length, 0);
  ui.frames.shift()();
  assert.equal(ui.opened.length, 0);
  ui.frames.shift()();
  assert.equal(ui.opened.length, 0);
  assert.equal(ui.timers[0].delay, 220);
  ui.timers.shift().fn();
  assert.equal(ui.opened[0][0].name, 'Street tacos');
  assert.equal(ui.opened[0][2], 3);
  assert.equal(ui.opened[0][3], true);
});

test('normal/invalid links leave the menu alone and invalid photo indices use photo one', () => {
  for (const query of ['', '?dish=missing', '?dish=../../bad']) {
    const ui = arrival(query); ui.flush(); assert.equal(ui.opened.length, 0);
  }
  for (const value of ['999', '-1', 'bad']) {
    const ui = arrival('?dish=street-tacos&photo=' + value); ui.flush();
    assert.equal(ui.opened[0][2], 0);
  }
});

test('manual popup actions or another open dialog cancel a pending automatic popup', () => {
  const manual = arrival('?dish=street-tacos'); manual.context.productOpenVersion++; manual.flush();
  assert.equal(manual.opened.length, 0);
  const dialog = arrival('?dish=street-tacos'); dialog.context.document.querySelector = () => ({}); dialog.flush();
  assert.equal(dialog.opened.length, 0);
});
