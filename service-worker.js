// service-worker.js

// Hata Ayıklama Logu: Service Worker sürümü ve önbellek adı
const CACHE_NAME = 'karne-yorumu-v6'; // Önbellek sürümünü artırarak eski önbelleklerin temizlenmesini sağlıyoruz.
console.log(`Service Worker: Yükleniyor (Sürüm: ${CACHE_NAME})`);

// Önbelleğe alınacak kaynakların listesi (SADECE VARLIĞI KESİN OLAN DOSYALAR)
const urlsToCache = [
  '/karne-gorusleri/',
  '/karne-gorusleri/index.html',
  '/karne-gorusleri/comment_templates_data.js',
  '/karne-gorusleri/manifest.json',

  // CSS Dosyaları
  '/karne-gorusleri/css/reset.css',
  '/karne-gorusleri/css/global.css',
  '/karne-gorusleri/css/layout.css',
  '/karne-gorusleri/css/components.css',
  '/karne-gorusleri/css/forms.css',
  '/karne-gorusleri/css/modals.css',
  '/karne-gorusleri/css/theme.css',
  '/karne-gorusleri/css/responsive.css',

  // JavaScript Modül Yolları
  '/karne-gorusleri/js/utils.js',
  '/karne-gorusleri/js/ui-elements.js',
  '/karne-gorusleri/js/data-management.js',
  '/karne-gorusleri/js/dashboard.js',
  '/karne-gorusleri/js/modals.js',
  '/karne-gorusleri/js/comments-tab.js',
  '/karne-gorusleri/js/student-management-tab.js',
  '/karne-gorusleri/js/main.js'
  
  // NOT: İkon dosyaları, varlıkları 100% doğrulanana kadar geçici olarak kaldırıldı.
  // Bu, 'addAll' hatasını önleyecektir.
];

// Service Worker kurulum aşaması: statik dosyaları önbelleğe alır
self.addEventListener('install', event => {
  console.log('Service Worker: Kurulum (install) olayı tetiklendi.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Dosyalar önbelleğe alınıyor:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Tüm dosyalar başarıyla önbelleğe alındı.');
        return self.skipWaiting();
      })
      .catch(error => {
        // Bu hatanın artık görünmemesi gerekiyor.
        console.error('Service Worker: Önbelleğe alma sırasında hata:', error);
      })
  );
});

// Service Worker aktivasyon aşaması: eski önbellekleri temizler
self.addEventListener('activate', event => {
  console.log('Service Worker: Aktivasyon (activate) olayı tetiklendi.');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('Service Worker: Eski önbellek siliniyor:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
        console.log('Service Worker: Eski önbellekler başarıyla temizlendi.');
        return self.clients.claim();
    })
  );
});

// Service Worker fetch aşaması: kaynakları önbellekten veya ağdan alır
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') {
    return;
  }
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          if (networkResponse.ok) {
            // Sadece projenize ait dosyaları tekrar önbelleğe almayı deneyelim.
            if (networkResponse.url.includes(self.location.origin)) {
                 const responseToCache = networkResponse.clone();
                 cache.put(event.request, responseToCache);
            }
          }
          return networkResponse;
        });
      });
    })
  );
});