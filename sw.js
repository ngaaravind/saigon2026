// Service Worker — network-first strategy
// Always fetches latest when online, falls back to cache when offline

const CACHE_NAME = 'vieeetnam-v6';
const ASSETS = [
  '/vieeetnam2026/',
  '/vieeetnam2026/index.html',
  '/vieeetnam2026/favicon.png',
  '/vieeetnam2026/icon-192.png',
  '/vieeetnam2026/icon-512.png',
  '/vieeetnam2026/hero-saigon-2026.png'
];

// Cache core assets on install
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Clean up old caches on activate
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

// Network-first: try the network, fall back to cache
self.addEventListener('fetch', function(event) {
  // Only handle same-origin GET requests
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(event.request)
      .then(function(response) {
        // Got a fresh response — update the cache and return it
        var clone = response.clone();
        caches.open(CACHE_NAME).then(function(cache) {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(function() {
        // Offline — serve from cache
        return caches.match(event.request);
      })
  );
});
