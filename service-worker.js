const CACHE_NAME = 'karne-asistani-v1';
const urlsToCache = [
    './',
    './index.html',
    './manifest.json',
    './assets/css/styles.css',
    './assets/js/app.js',
    './assets/js/storage.js',
    './assets/js/students.js',
    './assets/js/comments.js',
    './assets/js/templates.js',
    './assets/js/ui.js',
    './yorumlar/5_1.json',
    './yorumlar/5_2.json',
    './yorumlar/6_1.json',
    './yorumlar/6_2.json',
    './yorumlar/7_1.json',
    './yorumlar/7_2.json',
    './yorumlar/8_1.json',
    './yorumlar/8_2.json',
    'https://cdn.tailwindcss.com',
    'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }

                return fetch(event.request).then(
                    response => {
                        // Check if we received a valid response
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }

                        // Clone the response
                        var responseToCache = response.clone();

                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(event.request, responseToCache);
                            });

                        return response;
                    }
                );
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];

    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
