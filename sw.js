const VERSION = 'potager-nexus-v13';

const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(VERSION)
      .then(cache => Promise.all(CORE.map(url => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('potager-nexus-') && k !== VERSION).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.open(VERSION).then(async cache => {
      const cached = await cache.match(event.request);
      const network = fetch(event.request)
        .then(response => { if (response.ok) cache.put(event.request, response.clone()); return response; })
        .catch(() => cached || Response.error());
      event.waitUntil(network.then(() => undefined, () => undefined));
      return cached || network;
    })
  );
});
