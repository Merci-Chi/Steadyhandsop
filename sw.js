const CACHE_VERSION = 'lead-board-20260817-1036';
const APP_SHELL = [
  './',
  './index.html',
  './css.css',
  './js.js',
  './manifest.webmanifest'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION).then(cache =>
      Promise.allSettled(APP_SHELL.map(url => cache.add(url)))
    )
  );
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => key === CACHE_VERSION ? null : caches.delete(key)));
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never cache or alter Supabase, CDN, or any other cross-origin request.
  if (url.origin !== self.location.origin) return;

  // Always get the freshest HTML/CSS/JS/JSON first.
  const isFreshAsset =
    request.mode === 'navigate' ||
    /\.(?:html?|css|js|json)$/i.test(url.pathname);

  if (isFreshAsset) {
    event.respondWith((async () => {
      try {
        const response = await fetch(request, { cache: 'no-store' });
        if (response && response.ok) {
          const cache = await caches.open(CACHE_VERSION);
          cache.put(request, response.clone()).catch(() => {});
        }
        return response;
      } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === 'navigate') {
          return (await caches.match('./index.html')) || Response.error();
        }
        throw error;
      }
    })());
    return;
  }

  // Images/icons can be cache-first, then refreshed from network when missing.
  event.respondWith((async () => {
    const cached = await caches.match(request);
    if (cached) return cached;

    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone()).catch(() => {});
    }
    return response;
  })());
});
