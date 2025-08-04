// sw.js - Service Worker para PWA

const CACHE_NAME = 'my-tool-box-cache-v1';
const urlsToCache = [
  '/',
  'index.html',
  'style.css',
  'script.js',
  'manifest.json',
  'logo.png',
  'logo-192.png',
  'logo-512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
];

// Evento de Instalação: Guarda os arquivos principais em cache para uso offline
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME )
      .then(cache => {
        console.log('Cache aberto e arquivos principais cacheados');
        return cache.addAll(urlsToCache);
      })
  );
});

// Evento de Fetch: Responde com os arquivos do cache se estiverem disponíveis
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se o arquivo estiver no cache, retorna ele
        if (response) {
          return response;
        }
        // Se não, busca na rede
        return fetch(event.request);
      })
  );
});
