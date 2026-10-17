const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { runInNewContext } = require('node:vm');
const root = resolve(__dirname, '../sites/eljefedejalisco');
const source = readFileSync(resolve(root, 'js.js'), 'utf8')
  .split('// Mobile viewport gestures: keep one-finger vertical scrolling available.')[1]
  .split('// Silent local clips and exclusive TikTok playback.')[0];

function gestures(coarse) {
  const handlers = new Map();
  runInNewContext(source, {
    window: { matchMedia: () => ({ matches: coarse }) },
    document: { addEventListener(type, handler, options) {
      assert.equal(options.passive, false);
      handlers.set(type, handler);
    } }
  });
  return (type, fingers = 1, cancelable = true) => {
    let prevented = false;
    handlers.get(type)({ touches: Array(fingers).fill({}), cancelable,
      preventDefault() { prevented = true; } });
    return prevented;
  };
}

test('mobile gestures block pinch while preserving one-finger scrolling', () => {
  const dispatch = gestures(true);
  assert.equal(dispatch('touchstart', 1), false);
  assert.equal(dispatch('touchmove', 1), false);
  assert.equal(dispatch('touchstart', 2), true);
  assert.equal(dispatch('touchmove', 2), true);
  assert.equal(dispatch('gesturestart'), true);
  assert.equal(dispatch('gesturechange'), true);
  assert.equal(dispatch('touchmove', 2, false), false);
});

test('fine-pointer desktop gestures are unaffected', () => {
  const dispatch = gestures(false);
  assert.equal(dispatch('gesturestart'), false);
  assert.equal(dispatch('gesturechange'), false);
  assert.equal(dispatch('touchmove', 2), false);
});
