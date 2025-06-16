const CACHE_NAME = 'karne-yorumu-v3'; // Önbellek adını güncelledik (yeni dosya yapısını fark etmesi için)
const urlsToCache = [
  '/',
  '/index.html',
  '/comment_templates_data.js',
  '/manifest.json',
  // Yeni İkon Yolları (Emin değilseniz tekrar kontrol edin)
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png', // Eğer bu da varsa
  '/icons/favicon.png', // Eğer bu da varsa
  '/icons/favicon-16x16.png', // Eğer bu da varsa
  '/icons/favicon-32x32.png', // Eğer bu da varsa
  '/favicon.ico', // Eğer kök dizinde favicon.ico varsa

  // Yeni CSS Modül Yolları
  '/css/base.css',
  '/css/layout.css',
  '/css/components.css',
  '/css/tabs.css',
  '/css/modals.css',
  '/css/theme.css',
  '/css/responsive.css',

  // Yeni JavaScript Modül Yolları
  '/js/utils.js',
  '/js/ui-elements.js',
  '/js/data-management.js',
  '/js/dashboard.js',
  '/js/modals.js',
  '/js/comments-tab.js',
  '/js/student-management-tab.js',
  '/js/main.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Dosyalar önbelleğe alınıyor:', urlsToCache);
        // addAll başarısız olursa yakalamak için daha sağlam bir yaklaşım
        return cache.addAll(urlsToCache).then(() => {
          console.log('Service Worker: Tüm dosyalar başarıyla önbelleğe alındı.');
        }).catch(error => {
          console.error('Service Worker: Önbelleğe alma sırasında hata:', error);
          // Hata durumunda bile kurulumu tamamla, böylece service worker aktif olabilir
          // ve hata ayıklama kolaylaşır.
        });
      })
      .catch(error => {
        console.error('Service Worker: Önbelleği açma başarısız oldu:', error);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Önbellekte varsa önbellekten döndür, yoksa ağı kullan
        if (response) {
          return response;
        }
        return fetch(event.request).then(
          function(response) {
            // Yanıt geçerli değilse
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Yanıtı klonla çünkü yanıt akışı sadece bir kez tüketilebilir
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                // Sadece GET isteklerini önbelleğe al
                if (event.request.method === 'GET') {
                    cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        ).catch(error => {
            console.error('Service Worker: Ağdan dosya getirme hatası:', event.request.url, error);
            // Ağ hatası durumunda alternatif bir yanıt döndürmek isteyebilirsiniz,
            // örneğin bir çevrimdışı sayfası.
            // return caches.match('/offline.html');
        });
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
  // Service Worker'ın anında kontrolü ele almasını sağlar
  event.waitUntil(clients.claim());
});