// service-worker.js

// Hata Ayıklama Logu: Service Worker sürümü ve önbellek adı
const CACHE_NAME = 'karne-yorumu-v6'; // Önbellek sürümünü artırarak eski önbelleklerin temizlenmesini sağlıyoruz.
console.log(`Service Worker: Yükleniyor (Sürüm: ${CACHE_NAME})`);

// Önbelleğe alınacak kaynakların listesi.
// DİKKAT: Bu listedeki her bir dosya yolu, sunucudaki tam yoluyla eşleşmelidir.
// Eğer bir dosya bile bulunamazsa, Service Worker'ın kurulumu (install olayı) başarısız olur.
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
  
  // NOT: İkon dosyaları, manifest hatasını ve olası 'addAll' hatalarını önlemek için
  // bu listeden ve manifest.json'dan kaldırılmıştır.
];

// Service Worker kurulum aşaması: statik dosyaları önbelleğe alır
self.addEventListener('install', event => {
  console.log('Service Worker: Kurulum (install) olayı tetiklendi.');
  // waitUntil, tarayıcıya bu işlem bitene kadar beklemesini söyler.
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Dosyalar önbelleğe alınıyor:', urlsToCache);
        // Belirtilen tüm dosyaları tek seferde önbelleğe ekler.
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker: Tüm dosyalar başarıyla önbelleğe alındı.');
        // skipWaiting, yeni Service Worker'ın eskiyi beklemeden hemen aktif olmasını sağlar.
        return self.skipWaiting();
      })
      .catch(error => {
        // Eğer addAll başarısız olursa (örn. bir dosya bulunamazsa), hata burada yakalanır.
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
        // Mevcut önbellek adı dışındaki tüm eski önbellekleri filtrele
        cacheNames.filter(cacheName => cacheName !== CACHE_NAME)
          .map(cacheName => {
            console.log('Service Worker: Eski önbellek siliniyor:', cacheName);
            // Eski önbellekleri siler.
            return caches.delete(cacheName);
          })
      );
    }).then(() => {
        console.log('Service Worker: Eski önbellekler başarıyla temizlendi.');
        // clients.claim, Service Worker'ın kontrolü hemen almasını sağlar.
        return self.clients.claim();
    })
  );
});

// Service Worker fetch aşaması: kaynak isteklerini yakalar ve yönetir
self.addEventListener('fetch', event => {
  // Sadece GET isteklerini işleme al
  if (event.request.method !== 'GET') {
    return;
  }
  
  // respondWith, tarayıcının varsayılan fetch davranışını geçersiz kılmamızı sağlar.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      // Önce önbellekte bir eşleşme arar.
      return cache.match(event.request).then(response => {
        // Eğer önbellekte bir yanıt varsa, onu döndür.
        if (response) {
          return response;
        }

        // Eğer önbellekte yoksa, ağdan (internetten) istemeyi dene.
        return fetch(event.request).then(networkResponse => {
          // Eğer ağdan gelen yanıt geçerliyse...
          if (networkResponse.ok) {
            // Sadece kendi projemize ait olan ve önbelleğe alınabilir dosyaları
            // dinamik olarak önbelleğe al. Bu, başlangıçta listede olmayan kaynaklar için yararlıdır.
            if (networkResponse.url.includes(self.location.origin)) {
                 const responseToCache = networkResponse.clone();
                 cache.put(event.request, responseToCache);
            }
          }
          // Ağdan gelen yanıtı döndür.
          return networkResponse;
        });
      });
    })
  );
});