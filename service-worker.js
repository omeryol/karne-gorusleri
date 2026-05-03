const STATIC_CACHE = 'karne-static-v4';
const RUNTIME_CACHE = 'karne-runtime-v4';

const precacheUrls = [
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
];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(STATIC_CACHE);
        await Promise.allSettled(precacheUrls.map((url) => cache.add(url)));
        self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keys = await caches.keys();
        await Promise.all(
            keys
                .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
                .map((key) => caches.delete(key))
        );
        await self.clients.claim();
    })());
});

self.addEventListener('fetch', (event) => {
    if (event.request.method !== 'GET') {
        return;
    }

    const requestUrl = new URL(event.request.url);
    const isSameOrigin = requestUrl.origin === self.location.origin;
    const isAppAsset = isSameOrigin && (
        request.mode === 'navigate' ||
        requestUrl.pathname.endsWith('.html') ||
        requestUrl.pathname.endsWith('.js') ||
        requestUrl.pathname.endsWith('.json') ||
        requestUrl.pathname.endsWith('.css')
    );

    if (isAppAsset) {
        event.respondWith(networkFirst(event.request));
        return;
    }

    if (isSameOrigin) {
        event.respondWith(cacheFirst(event.request));
        return;
    }

    event.respondWith(networkFirst(event.request));
});

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        const runtimeCache = await caches.open(RUNTIME_CACHE);
        runtimeCache.put(request, response.clone());
        return response;
    } catch (error) {
        if (request.mode === 'navigate') {
            const fallback = await caches.match('./index.html');
            if (fallback) {
                return fallback;
            }
        }

        return new Response('Offline ve kaynak bulunamadi.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }
}

async function networkFirst(request) {
    try {
        const response = await fetch(request);
        const runtimeCache = await caches.open(RUNTIME_CACHE);
        runtimeCache.put(request, response.clone());
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        return new Response('Offline ve dis kaynak bulunamadi.', {
            status: 503,
            headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
    }
}
