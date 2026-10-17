const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const root = resolve(__dirname, '../sites/eljefedejalisco');
const script = readFileSync(resolve(root, 'js.js'), 'utf8');
const block = script.slice(script.indexOf("    const productDialog=$('#product-dialog');"), script.indexOf('    cards.forEach(card=>'));

function gallery() {
  class Element {
    constructor() { this.children = []; this.handlers = {}; this.attributes = {}; this.open = false; this.isConnected = true; this.classList = { toggle() {}, remove() {} }; }
    append(node) { this.children.push(node); }
    replaceChildren() { this.children = []; }
    contains(node) { return this.children.includes(node); }
    setAttribute(k, v) { this.attributes[k] = v; }
    addEventListener(type, handler) { this.handlers[type] = handler; }
    showModal() { this.open = true; this.shows = (this.shows || 0) + 1; }
    close() { this.open = false; this.handlers.close(); }
    focus() { document.activeElement = this; }
    closest() { return null; }
  }
  const nodes = Object.fromEntries(['product-dialog', 'product-title', 'product-category', 'product-description', 'product-price', 'product-image', 'product-thumbs', 'product-position', 'product-previous', 'product-next', 'close-product'].map(id => [id, new Element()]));
  const all = [
    { name: 'Tacos', image: 'taco-1.jpg', photos: ['taco-1.jpg', 'taco-2.jpg', 'taco-3.jpg'] },
    { name: 'Burritos', image: 'burrito-1.jpg', photos: ['burrito-1.jpg', 'burrito-2.jpg', 'burrito-3.jpg'] },
    { name: 'Sopes', image: 'sope.jpg', photos: [] }
  ];
  const cards = all.map((item, index) => ({ dataset: { productIndex: String(index) }, hidden: false, link: new Element() }));
  const document = { activeElement: null };
  const context = { all, cards, document, safeUrl: url => url, make: () => new Element(),
    $: (selector, parent) => selector === '[data-product]' ? parent.link : nodes[selector.replace(/^[#.]/, '')] };
  runInNewContext(block + '\nglobalThis.open = openProduct; globalThis.move = moveProduct;', context);
  return { nodes, cards, document,
    open: (index = 0) => context.open(all[index], cards[index].link),
    move: delta => context.move(delta),
    photo: () => nodes['product-image'].src,
    key(key, extra = {}) {
      let prevented = false;
      nodes['product-dialog'].handlers.keydown({ key, target: new Element(), preventDefault() { prevented = true; }, stopPropagation() {}, ...extra });
      return prevented;
    }
  };
}

test('right arrows traverse all photos then the next item without reopening the popup', () => {
  const ui = gallery(); ui.open();
  const photos = [ui.photo()];
  for (let n = 0; n < 5; n++) { assert.equal(ui.key('ArrowRight'), true); photos.push(ui.photo()); }
  assert.deepEqual(photos, ['taco-1.jpg', 'taco-2.jpg', 'taco-3.jpg', 'burrito-1.jpg', 'burrito-2.jpg', 'burrito-3.jpg']);
  assert.equal(ui.nodes['product-dialog'].shows, 1);
  assert.equal(ui.nodes['product-title'].textContent, 'Burritos');
  assert.match(ui.nodes['product-position'].textContent, /Photo 3 of 3/);
});

test('left arrows return from the first photo to the previous item’s last photo', () => {
  const ui = gallery(); ui.open(1);
  for (const expected of ['taco-3.jpg', 'taco-2.jpg', 'taco-1.jpg']) {
    ui.key('ArrowLeft'); assert.equal(ui.photo(), expected);
  }
  assert.equal(ui.nodes['product-thumbs'].children[0].attributes['aria-pressed'], 'true');
});

test('thumbnails update navigation position and touch buttons follow the same sequence', () => {
  const ui = gallery(); ui.open();
  ui.nodes['product-thumbs'].children[2].handlers.click();
  ui.nodes['product-next'].handlers.click();
  assert.equal(ui.photo(), 'burrito-1.jpg');
  ui.nodes['product-previous'].handlers.click();
  assert.equal(ui.photo(), 'taco-3.jpg');
});

test('navigation respects visible results and loops through single-photo items', () => {
  const ui = gallery(); ui.cards[1].hidden = true; ui.open();
  ui.move(1); ui.move(1); ui.move(1);
  assert.equal(ui.photo(), 'sope.jpg');
  ui.move(1); assert.equal(ui.photo(), 'taco-1.jpg');
  ui.move(-1); assert.equal(ui.photo(), 'sope.jpg');
});

test('closing restores focus to the viewed dish and modified arrows are ignored', () => {
  const ui = gallery(); ui.open(1);
  assert.equal(ui.key('ArrowRight', { ctrlKey: true }), false);
  assert.equal(ui.photo(), 'burrito-1.jpg');
  ui.move(-1);
  ui.nodes['product-dialog'].close();
  assert.equal(ui.document.activeElement, ui.cards[0].link);
  assert.equal(ui.key('ArrowRight'), false);
  ui.open(1); assert.equal(ui.photo(), 'burrito-1.jpg');
});
