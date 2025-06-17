// service-worker.js

// Hata Ayıklama Logu: Service Worker sürümü ve önbellek adı
const CACHE_NAME = 'karne-yorumu-v5'; // Önbellek sürümünü artırarak eski önbelleklerin temizlenmesini sağlıyoruz.
console.log(`Service Worker: Yükleniyor (Sürüm: ${CACHE_NAME})`);

// Önbelleğe alınacak kaynakların listesi (GitHub Pages için tam yollarla güncellendi)
// Projenizin depo adı: /karne-gorusleri
const urlsToCache = [
  '/karne-gorusleri/',
  '/karne-gorusleri/index.html',
  '/karne-gorusleri/comment_templates_data.js',
  '/karne-gorusleri/manifest.json',

  // İkon Yolları
  '/karne-gorusleri/icons/icon-192x192.png',
  '/karne-gorusleri/icons/icon-512x512.png',
  '/karne-gorusleri/icons/apple-touch-icon.png',
  '/karne-gorusleri/icons/favicon.png',
  '/karne-gorusleri/icons/favicon-16x16.png',
  '/karne-gorusleri/icons/favicon-32x32.png',
  '/karne-gorusleri/favicon.ico',

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
        // Yeni Service Worker'ın beklemeden aktif olmasını sağla
        return self.skipWaiting();
      })
      .catch(error => {
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
        cacheNames.filter(cacheName => {
          // Mevcut önbellek dışındaki tüm eski önbellekleri sil
          return cacheName !== CACHE_NAME;
        }).map(cacheName => {
          console.log('Service Worker: Eski önbellek siliniyor:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(() => {
        console.log('Service Worker: Eski önbellekler başarıyla temizlendi.');
        // Aktif olan service worker'ın kontrolü hemen ele almasını sağla
        return self.clients.claim();
    })
  );
});

// Service Worker fetch aşaması: kaynakları önbellekten veya ağdan alır
self.addEventListener('fetch', event => {
  // Sadece GET isteklerine yanıt ver, diğerlerini (POST vb.) atla
  if (event.request.method !== 'GET') {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(response => {
        // Önbellekte varsa önbellekten döndür (Cache-First stratejisi)
        if (response) {
          // console.log('Service Worker: Önbellekten yanıt veriliyor:', event.request.url);
          return response;
        }

        // Önbellekte yoksa ağdan getir
        // console.log('Service Worker: Önbellekte yok, ağdan getiriliyor:', event.request.url);
        return fetch(event.request).then(networkResponse => {
          // Yanıtı klonla çünkü yanıt akışı sadece bir kez tüketilebilir
          const responseToCache = networkResponse.clone();
          
          // Ağa yapılan isteği önbelleğe al
          // Sadece başarılı (200 OK) yanıtları ve temel (basic) türdeki istekleri önbelleğe al
          if (networkResponse.ok && networkResponse.type === 'basic') {
            cache.put(event.request, responseToCache);
          }
          
          return networkResponse;
        }).catch(error => {
            console.error('Service Worker: Ağdan dosya getirme hatası:', event.request.url, error);
            // Ağ hatası durumunda çevrimdışı bir sayfa gösterilebilir (opsiyonel)
            // return caches.match('/karne-gorusleri/offline.html');
        });
      });
    })
  );
});