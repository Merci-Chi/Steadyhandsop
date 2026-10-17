const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const root = resolve(__dirname, '../sites/eljefedejalisco');
const read = path => readFileSync(resolve(root, path), 'utf8');

test('three local Facebook players use real local clips and posters in source and dist', () => {
  for (const prefix of ['', 'dist/']) {
    const html = read(prefix + 'index.html');
    assert.equal((html.match(/<video controls playsinline preload="none"/g) || []).length, 3);
    assert.ok(!html.includes('facebook.com/plugins/video.php'));
    assert.ok(!html.includes('facebook.com/share/'));
    for (const match of html.matchAll(/(?:src|poster)="(assets\/videos\/[^"?]+)"/g)) {
      assert.ok(existsSync(resolve(root, prefix, match[1])), match[1]);
    }
  }
  const window = {};
  runInNewContext(read('content.js'), { window });
  for (const item of window.EL_JEFE.videos.filter(item => item.platform.startsWith('FACEBOOK'))) {
    assert.ok(existsSync(resolve(root, item.src)));
    assert.ok(existsSync(resolve(root, item.poster)));
  }
});

test('TikTok error handler checks origin, source, and message type before showing fallback', () => {
  let handler;
  const parent = { replaceChildren(node) { this.message = node; } };
  const frame = { parentElement: parent, contentWindow: {}, addEventListener() {} };
  runInNewContext(read('js.js').split('// TikTok documents playback failures through its player message API.')[1], {
    window: { addEventListener(type, fn) { handler = fn; } },
    document: {
      querySelector: () => frame, querySelectorAll: () => [],
      createElement: () => ({ setAttribute() {} })
    }
  });
  const event = { origin: 'https://www.tiktok.com', source: frame.contentWindow, data: { 'x-tiktok-player': true, type: 'onPlayerError' } };
  handler({ ...event, origin: 'https://example.com' });
  handler({ ...event, source: {} });
  handler({ ...event, data: { 'x-tiktok-player': true, type: 'onPlayerReady' } });
  assert.equal(parent.message, undefined);
  handler(event);
  assert.match(parent.message.textContent, /Watch the original/);
});
