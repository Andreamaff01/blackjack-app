// Service worker (D-016, ADR-0014): l'app funziona offline dopo la prima apertura. Pagine: prima la rete, poi la copia; file con
// l'impronta nel nome (/assets/): prima la copia. Cambiare VERSIONE a ogni rilascio per buttare le copie vecchie.
const VERSIONE = 'bjqa-v2';
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSIONE).then((c) => c.addAll(['./', './index.html', './manifest.webmanifest', './icona.svg'])));
  self.skipWaiting();
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((k) => Promise.all(k.filter((x) => x !== VERSIONE).map((x) => caches.delete(x)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  if (r.mode === 'navigate') {
    e.respondWith(fetch(r).then((x) => { const c = x.clone(); caches.open(VERSIONE).then((k) => k.put(r, c)); return x; }).catch(() => caches.match(r).then((x) => x || caches.match('./index.html'))));
    return;
  }
  e.respondWith(caches.match(r).then((x) => x || fetch(r).then((y) => { if (y.ok) { const c = y.clone(); caches.open(VERSIONE).then((k) => k.put(r, c)); } return y; })));
});
