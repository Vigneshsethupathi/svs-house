const CACHE_NAME = 'svs-house-v1';
const urlsToCache = ['/', '/index.html', '/static/js/main.chunk.js', '/static/css/main.chunk.css'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache).catch(() => {})));
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  event.waitUntil(
    self.registration.showNotification(data.title || 'SVS House', {
      body: data.body || 'New update',
      icon: '/logo192.png',
      badge: '/favicon.ico'
    })
  );
});
