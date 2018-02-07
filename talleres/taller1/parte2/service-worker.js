var dataCacheName = "scheduleData-v1"; 

var cacheName = 'schedulePWA-step-6-1';
var filesToCache = [
    '/',
    '/index.html',
    '/scripts/app.js',
    '/styles/inline.css',
    '/images/ic_add_white_24px.svg',
    '/images/ic_refresh_white_24px.svg',
    '/images/icon-192x192.png',
    '/images/metro_image.jpg'
  ];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
    console.log('[ServiceWorker] Activate');
    e.waitUntil(
        caches.keys().then(function(keyList){
            return Promise.all(keyList.map(function(key){
                if(key!== cacheName && key != dataCacheName){
                    console.log('[ServiceWorker] Removing old cache', key);
                    return caches.delete(key);
                }
            }));
        })
    );
    return self.clients.claim();
});

self.addEventListener('fetch',function(e){
    console.log('[ServiceWorker] Fetch', e.request.url);
    var dataUrl = 'https://api-ratp.pierre-grimaud.fr/v3/schedules';
    if(e.request.url.indexOf(dataUrl) > -1){
        e.respondWith(
            caches.open(dataCacheName).then(function(cache){
                return fetch(e.request).then(function(response){
                    cache.put(e.request.url, response.clone());
                    return response;
                });
            })
        );
    }
    else{
        /*
        * The app is asking for app shell files. In this scenario the app uses the
        * "Cache, falling back to the network" offline strategy:
        * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
        */ 
        e.respondWith(
            caches.match(e.request).then(function(response) {
            return response || fetch(e.request);
            })
        );
    }
});