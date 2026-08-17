// Lead Board service worker retired.
// The app now reads lead data directly from Supabase and app files from the network.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(key => caches.delete(key)));
    await self.clients.claim();
    await self.registration.unregister();
  })());
});

self.addEventListener('fetch', () => {
  // No fetch interception.
});
