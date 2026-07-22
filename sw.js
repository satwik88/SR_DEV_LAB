const CACHE_NAME = 'SR-DEV-LAB-v4';
const ASSETS_TO_CACHE = [
  '/',
  '/styles.css',
  '/script.js',
  '/projects-component.js',
  '/site.webmanifest',
  '/assets/logo.png',
  '/assets/portfolio.png',
  '/assets/icon-192.png',
  '/assets/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.all(
          ASSETS_TO_CACHE.map(url =>
            cache.add(url).catch(err => console.error('[SW] Failed to cache:', url, err))
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic' || !event.request.url.startsWith('http')) {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseToCache));
          return networkResponse;
        }).catch(() => {
          return new Response('', { status: 408, statusText: 'Offline - resource not cached' });
        });
      })
  );
});
