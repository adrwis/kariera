/* NextMove — Service Worker */
const CACHE_NAME = 'nextmove-v1';
const APP_SHELL = [
  '/kariera/',
  '/kariera/index.html',
  '/kariera/css/style.css',
  '/kariera/js/app.js',
  '/kariera/js/search.js',
  '/kariera/js/animations.js',
  '/kariera/data/careers.json',
  '/kariera/data/kzis-index.json',
  '/kariera/manifest.json',
  '/kariera/favicon.svg',
  '/kariera/icons/icon-192.png',
  '/kariera/icons/icon-512.png',
];

// Install: precache app shell
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: cache-first for app shell, network-first for external
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip non-GET and cross-origin (except Google Fonts + CDN)
  if (e.request.method !== 'GET') return;

  // For same-origin requests: cache-first
  if (url.origin === self.location.origin) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const fetchPromise = fetch(e.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // For CDN (Fuse.js, Google Fonts): stale-while-revalidate
  if (url.hostname.includes('jsdelivr.net') || url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    e.respondWith(
      caches.match(e.request).then((cached) => {
        const fetchPromise = fetch(e.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, clone));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
});
