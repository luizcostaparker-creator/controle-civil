/* Central de controle CIVIL – service worker (gerado por ATUALIZAR APP; versão 2026-10-28-144244)
   Guarda o sistema e as bibliotecas no aparelho: o app abre sem internet.
   Os dados da obra NÃO passam por aqui – ficam no navegador do aparelho (localStorage + IndexedDB). */
const CACHE = 'controle-civil-2026-10-28-144244';
// opcionais: se faltar algum no site, o app instala mesmo assim
const ICONES = ['./icon-192.png', './icon-512.png', './apple-touch-icon.png',
  './apontamento.html', './apontamento.webmanifest', './icon-ap-192.png', './icon-ap-512.png', './apple-touch-icon-ap.png', './mapa.html', './prancha.html',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js', 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js'];
// planta.jpg (~1,5 MB) não é baixada na instalação: fica guardada na 1ª vez que o mapa abre
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
  // app Apontamento recebendo o arquivo pelo "Compartilhar" do Android (share_target do apontamento.webmanifest):
  // guarda o arquivo e abre o app com ?recebido=1, que o lê daqui
  if (e.request.method === 'POST' && new URL(e.request.url).searchParams.has('receber')) {
    e.respondWith((async () => {
      try {
        const fd = await e.request.formData(), arq = fd.get('arquivo');
        if (arq && arq.size) await (await caches.open('apontamento-recebido')).put('./recebido', new Response(arq));
      } catch (err) {}
      return Response.redirect('./apontamento.html?recebido=1', 303);
    })());
    return;
  }
  if (e.request.method !== 'GET') return;
  // páginas (sistema e apontamento): busca a versão publicada quando há internet (e guarda); sem internet usa a guardada
  if (e.request.mode === 'navigate') {
    const nome = new URL(e.request.url).pathname.split('/').pop();
    const pag = './' + (/\.html$/.test(nome) ? nome : 'index.html');  // index, apontamento ou mapa (aba 4)
    e.respondWith(fetch(e.request.url, { cache: 'no-cache', credentials: 'same-origin' })
      .then(r => { if (r.ok) { const c = r.clone(); caches.open(CACHE).then(k => k.put(pag, c)); } return r; })
      .catch(() => caches.match(pag).then(r => r || caches.match('./index.html'))));
    return;
  }
  // bibliotecas, ícones, manifest e planta.jpg: do aparelho primeiro (o que vier da internet fica guardado)
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(r => r || fetch(e.request).then(res => {
      if (res.ok && new URL(e.request.url).origin === location.origin) { const c = res.clone(); caches.open(CACHE).then(k => k.put(e.request, c)); }
      return res;
    }))
  );
});