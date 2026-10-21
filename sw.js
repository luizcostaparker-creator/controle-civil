/* Central de controle CIVIL – service worker (gerado por ATUALIZAR APP; versão 2026-10-21-090937)
   Guarda o sistema e as bibliotecas no aparelho: o app abre sem internet.
   Os dados da obra NÃO passam por aqui – ficam no navegador do aparelho (localStorage + IndexedDB). */
const CACHE = 'controle-civil-2026-10-21-090937';
const ICONES = ['./icon-192.png', './icon-512.png', './apple-touch-icon.png']; // opcionais: se faltar algum, o app instala mesmo assim
const ARQUIVOS = [
  './', './index.html', './manifest.webmanifest',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js'
];
self.addEventListener('install', e => {
  self.skipWaiting(); // versão nova assume sem esperar clique
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARQUIVOS)
    .then(() => Promise.all(ICONES.map(u => c.add(u).catch(() => {}))))));
});
self.addEventListener('message', e => { if (e.data === 'ativar') self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('controle-civil-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(r => r ||
      fetch(e.request).catch(() => e.request.mode === 'navigate' ? caches.match('./index.html') : Response.error()))
  );
});