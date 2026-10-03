/* NextMove — Service Worker */
const CACHE_NAME = 'nextmove-v10';
const APP_SHELL = [
  '/kariera/',
  '/kariera/index.html',
  '/kariera/css/style.min.css',
  '/kariera/js/app.min.js',
  '/kariera/js/search.min.js',
  '/kariera/js/szkoly.min.js',
  '/kariera/js/quiz.min.js',
  '/kariera/js/zagranica.min.js',
  '/kariera/data/zagranica/index.json',
  '/kariera/js/feedback.min.js',
  '/kariera/data/szkoly/index.json',
  '/kariera/js/animations.min.js',
  '/kariera/js/vendor/fuse.min.js',
  '/kariera/data/careers.min.json',
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

// Fetch: network-first for same-origin files (always fresh and consistent after a deploy),
// cached copy as offline fallback. Navigation always resolves to index.html (SPA).
// Przy słabym zasięgu sieć dostaje 4 s, potem odpowiada kopia z pamięci podręcznej (jeśli jest)
const NETWORK_TIMEOUT_MS = 4000;
function networkFirst(request, cacheKey) {
  const network = fetch(request, { cache: 'no-cache' }).then((response) => {
    if (response.ok) {
      const clone = response.clone();
      caches.open(CACHE_NAME).then((cache) => cache.put(cacheKey || request, clone));
    }
    return response;
  });
  const timeout = new Promise((resolve) => setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS))
    .then(() => caches.match(cacheKey || request))
    .then((cached) => cached || new Promise(() => {}));
  return Promise.race([network, timeout]).catch(() => caches.match(cacheKey || request));
}

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Skip non-GET and cross-origin (except Google Fonts + CDN)
  if (e.request.method !== 'GET') return;

  if (url.origin === self.location.origin) {
    if (e.request.mode === 'navigate' && url.pathname.startsWith('/kariera/') && !/\.[a-z0-9]+$/i.test(url.pathname)) {
      e.respondWith(networkFirst('/kariera/index.html', '/kariera/index.html'));
      return;
    }
    e.respondWith(networkFirst(e.request));
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
