// This service worker has been retired. It previously caused returning
// browsers to show a stale, frozen version of the dashboard after a deploy.
// On activation it deletes every cache it created and unregisters itself,
// then refreshes any open tab so it loads clean going forward.
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll())
      .then(clients => clients.forEach(client => client.navigate(client.url)))
  );
});
