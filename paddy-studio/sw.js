/* Bump CACHE_NAME on every deploy or the old shell is served from cache
   and the new build never reaches the device. This is the single most
   common cause of "I uploaded it but nothing changed". */
const CACHE_NAME = 'paddy-studio-v6';
const ASSETS = [
  'index.html',
  'checkin.html',
  'book_meeting.html',
  'debrief.html',
  'manifest.json',
  'icon-192.png',
  'icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS).catch(() => {}))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => key !== CACHE_NAME ? caches.delete(key) : null)))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  // Never cache the Make.com proxy calls, they must always hit the network.
  if (event.request.url.indexOf('hook.us2.make.com') > -1) return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response && (response.status === 200 || response.status === 0)) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)).catch(() => {});
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => {
        if (cached) return cached;
        if (event.request.mode === 'navigate') return caches.match('index.html');
      }))
  );
});
