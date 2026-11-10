/* Full desktop-width previews, scaled to the card width.
   Scrolling is native inside each iframe, so it stops at the real end
   of the external website rather than an invented document height. */
(function () {
  'use strict';
  var DESKTOP_WIDTH = 1440;
  function resizePreviews() {
    document.querySelectorAll('.references-main .ref-iframe-clip').forEach(function (clip) {
      var width = clip.clientWidth;
      if (!width) return;
      var scale = width / DESKTOP_WIDTH;
      clip.style.setProperty('--desktop-preview-scale', String(scale));
      // Keep the iframe viewport as tall as the visibly clipped area.
      // Its own document will do the actual, bounded scrolling.
      clip.style.setProperty('--desktop-preview-viewport-height', Math.ceil(clip.clientHeight / scale) + 'px');
    });
  }
  function init() {
    document.querySelectorAll('.references-main .ref-preview-wheel, .references-main .ref-preview-scroll-hint').forEach(function (element) {
      element.remove();
    });
    resizePreviews();
    if ('ResizeObserver' in window) {
      var observer = new ResizeObserver(resizePreviews);
      document.querySelectorAll('.references-main .ref-iframe-clip').forEach(function (clip) { observer.observe(clip); });
    }
    window.addEventListener('resize', resizePreviews, {passive:true});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
