// Mtaa Pulse service worker: makes the site installable and lets the app shell open when the phone is offline.
// Network first, so a new version of the site always wins when there is a connection. Only this site's own files are touched;
// calls to the server (onrender.com), Bunny video and map tiles go straight through untouched.
const CACHE = 'mtaa-pulse-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin || req.headers.has('range')) return;
  e.respondWith(
    fetch(req).then(res => {
      if (res && res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match(req).then(hit => hit || (req.mode === 'navigate' ? caches.match('/') : Response.error())))
  );
});
