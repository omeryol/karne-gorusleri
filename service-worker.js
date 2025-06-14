const CACHE_NAME = 'karne-yorumu-v2'; // Önbellek adını güncelledik (yeni dosyayı fark etmesi için)
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/script.js',
  '/comment_templates_data.js', // Yeni eklenen yorumlar dosyası
  '/manifest.json',
  // İkonları da önbelleğe almayı unutmayın (Eğer icons klasörünü oluşturup içine ikonları koyduysan)
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Dosyalar önbelleğe alınıyor:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('Service Worker: Önbelleğe alma başarısız oldu:', error);
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
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
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
});