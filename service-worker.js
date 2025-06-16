// service-worker.js

// Hata Ayıklama Logu: Service Worker sürümü
console.log('Service Worker: Yükleniyor (Sürüm: karne-yorumu-v4)');
const CACHE_NAME = 'karne-yorumu-v4'; // Önbellek adını güncelledik (yeni dosya yapısını fark etmesi için)
const urlsToCache = [
  '/',
  '/index.html',
  '/comment_templates_data.js',
  '/manifest.json',

  // Yeni İkon Yolları (Mevcut dizin yapınıza göre)
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon.png',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png',
  '/favicon.ico',

  // Yeni CSS Modül Yolları (Değiştirildi)
  '/css/reset.css',        // Yeni
  '/css/global.css',       // Yeni
  '/css/layout.css',       // Güncellendi
  '/css/components.css',   // Güncellendi
  '/css/forms.css',        // Yeni
  '/css/modals.css',       // Güncellendi
  '/css/theme.css',        // Güncellendi
  '/css/responsive.css',   // Güncellendi
  // '/css/base.css',       // Kaldırıldı
  // '/css/tabs.css',       // Kaldırıldı

  // Yeni JavaScript Modül Yolları (Mevcut isimler korundu ama doğrulanmalı)
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
  // Hata Ayıklama Logu: Kurulum aşaması başlıyor
  console.log('Service Worker: Kurulum (install) olayı tetiklendi.');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Dosyalar önbelleğe alınıyor:', urlsToCache);
        // addAll başarısız olursa yakalamak için daha sağlam bir yaklaşım
        return cache.addAll(urlsToCache).then(() => {
          console.log('Service Worker: Tüm dosyalar başarıyla önbelleğe alındı.');
          // Hata Ayıklama Logu: Kurulum başarılı
          console.log('Service Worker: Kurulum başarıyla tamamlandı.');
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
  // Hata Ayıklama Logu: Fetch isteği dinleniyor
  // console.log('Service Worker: Fetch isteği:', event.request.url); // Çok fazla log üretebilir, dikkatli kullanın
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Önbellekte varsa önbellekten döndür, yoksa ağı kullan
        if (response) {
          console.log('Service Worker: Önbellekten yanıt veriliyor:', event.request.url);
          return response;
        }
        console.log('Service Worker: Önbellekte yok, ağdan getirilmeye çalışılıyor:', event.request.url);
        return fetch(event.request).then(
          function(response) {
            // Yanıt geçerli değilse
            if(!response || response.status !== 200 || response.type !== 'basic') {
              console.warn('Service Worker: Geçersiz ağ yanıtı:', event.request.url, response.status, response.type);
              return response;
            }

            // Yanıtı klonla çünkü yanıt akışı sadece bir kez tüketilebilir
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                // Sadece GET isteklerini önbelleğe al
                if (event.request.method === 'GET') {
                    console.log('Service Worker: Ağdan getirilen yanıt önbelleğe alınıyor:', event.request.url);
                    cache.put(event.request, responseToCache);
                }
              });

            return response;
          }
        ).catch(error => {
            console.error('Service Worker: Ağdan dosya getirme hatası:', event.request.url, error);
            // Ağ hatası durumunda alternatif bir yanıt döndürmek isteyebilirsiniz,
            // örneğin bir çevrimdışı sayfası.
            // if (event.request.mode === 'navigate') { // Sadece navigasyon istekleri için
            //     return caches.match('/offline.html'); // Eğer böyle bir sayfanız varsa
            // }
            // Hata durumunda boş yanıt veya başka bir hata fırlatılabilir
            return new Response('Ağ bağlantısı yok veya dosya bulunamadı.', {
                status: 503,
                statusText: 'Service Unavailable',
                headers: new Headers({
                    'Content-Type': 'text/plain'
                })
            });
        });
      })
  );
});

self.addEventListener('activate', event => {
  // Hata Ayıklama Logu: Aktivasyon aşaması başlıyor
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
    })
  );
  // Service Worker'ın anında kontrolü ele almasını sağlar
  event.waitUntil(clients.claim());
  console.log('Service Worker: Kontrol anında devralındı.');
});

// Yeni: Debugging için loglar
self.addEventListener('message', event => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
        console.log('Service Worker: skipWaiting() mesajı alındı, yeni SW hemen aktif ediliyor.');
    }
});