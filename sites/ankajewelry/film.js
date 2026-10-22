'use strict';
// Start the ambient film immediately, independently of the deferred page UI.
(() => {
  const video = document.getElementById('hero-video');
  if (!video) return;
  video.defaultMuted = true;
  video.muted = true;
  video.autoplay = true;
  video.loop = true;
  video.playsInline = true;
  video.controls = false;
  video.setAttribute('muted', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');

  let pending = false;
  let retryTimer;
  let retries = 0;
  function start() {
    if (document.hidden || !video.paused || pending) return;
    pending = true;
    const attempt = video.play();
    if (!attempt || typeof attempt.then !== 'function') { pending = false; return; }
    attempt.then(() => {
      pending = false;
      clearTimeout(retryTimer);
      retries = 0;
    }).catch(() => {
      pending = false;
      // Retry startup without waiting for a scroll or touch.
      clearTimeout(retryTimer);
      if (!document.hidden && retries++ < 20) retryTimer = setTimeout(start, 500);
    });
  }
  function resume() {
    retries = 0;
    if (document.hidden) {
      clearTimeout(retryTimer);
      video.pause();
    } else start();
  }
  ['loadedmetadata', 'loadeddata', 'canplay'].forEach(event => video.addEventListener(event, start));
  document.addEventListener('visibilitychange', resume);
  window.addEventListener('pageshow', resume);
  window.addEventListener('load', start);
  if (typeof IntersectionObserver !== 'undefined') {
    new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) start();
    }).observe(video);
  }
  // Retain recovery for browsers whose user settings explicitly require a gesture.
  ['touchend', 'click', 'keydown'].forEach(event => document.addEventListener(event, resume, { passive: true }));
  start();
})();
