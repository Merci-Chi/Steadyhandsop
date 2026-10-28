/* Half-video ping-pong. Browsers do not reliably support negative playbackRate,
   so reverse uses timed seeks. Replace with an offline rendered ping-pong MP4
   for frame-perfect reverse playback if the source file becomes available. */
(() => {
  const video = document.getElementById('feature-video');
  if (!video) return;
  video.muted = true; video.playsInline = true; video.loop = false;
  let midpoint = 0, reverseTimer = 0, lastTick = 0, direction = 'forward';
  const FPS = 20, STEP = 1 / FPS;
  function stopReverse() { clearInterval(reverseTimer); reverseTimer = 0; }
  function forward() {
    stopReverse(); direction = 'forward'; video.currentTime = 0;
    const play = video.play(); if (play && play.catch) play.catch(() => {});
  }
  function backwards() {
    if (direction === 'reverse') return;
    direction = 'reverse'; video.pause();
    let position = midpoint; lastTick = performance.now();
    stopReverse(); reverseTimer = setInterval(() => {
      if (document.hidden) return;
      const now = performance.now();
      position = Math.max(0, position - Math.min(.15,(now - lastTick) / 1000));
      lastTick = now;
      try { video.currentTime = position; } catch (_) {}
      if (position <= STEP) forward();
    }, 1000 / FPS);
  }
  function init() {
    if (!Number.isFinite(video.duration) || video.duration <= 0) return;
    midpoint = video.duration / 2;
    video.addEventListener('timeupdate', () => {
      if (direction === 'forward' && video.currentTime >= midpoint - .035) backwards();
    });
    video.addEventListener('ended', backwards);
    forward();
  }
  if (video.readyState >= 1) init(); else video.addEventListener('loadedmetadata',init,{once:true});
  document.addEventListener('visibilitychange', () => { if (!document.hidden && direction === 'reverse') lastTick=performance.now(); });
})();
