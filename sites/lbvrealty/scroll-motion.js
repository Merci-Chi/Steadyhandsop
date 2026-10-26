(() => {
  const artwork = document.querySelector('.artwork');
  if (!artwork) return;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (reduce.matches) return;

  let ticking = false;
  const update = () => {
    const rect = artwork.getBoundingClientRect();
    const viewport = window.innerHeight || document.documentElement.clientHeight;
    const start = Math.min(viewport, artwork.offsetTop + artwork.offsetHeight);
    const progress = Math.max(0, Math.min((start - rect.top) * 0.5, artwork.offsetHeight));
    artwork.style.setProperty('--scroll-y', `${progress.toFixed(1)}px`);
    ticking = false;
  };

  const requestTick = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', requestTick, { passive: true });
  window.addEventListener('resize', requestTick, { passive: true });
  requestTick();
})();
