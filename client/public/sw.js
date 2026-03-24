/* client/public/sw.js */
const STATIC_CACHE = 'trotixai-static-v1';
const DYNAMIC_CACHE = 'trotixai-dynamic-v1';

const STATIC_ASSETS = [
    '/',
    '/manifest.json',
    '/src/styles.css',
    '/src/index.js',
    '/src/components/UploadScreen.js',
    '/src/components/JobCard.js',
    '/src/components/JobDetail.js',
    '/src/pwa-register.js',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    'https://unpkg.com/react@18/umd/react.production.min.js',
    'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js',
    'https://unpkg.com/@babel/standalone/babel.min.js',
];

self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(STATIC_CACHE)
            .then((c) => c.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', (e) => {
    const valid = [STATIC_CACHE, DYNAMIC_CACHE];
    e.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => !valid.includes(k)).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (e) => {
    const url = new URL(e.request.url);
    if (e.request.method !== 'GET') return;
    if (url.pathname.startsWith('/api/')) { e.respondWith(networkFirst(e.request)); return; }
    e.respondWith(cacheFirst(e.request));
});

async function cacheFirst(req) {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
        const res = await fetch(req);
        if (res.ok) (await caches.open(STATIC_CACHE)).put(req, res.clone());
        return res;
    } catch {
        if (req.mode === 'navigate') return caches.match('/');
        return new Response('Offline', { status: 503 });
    }
}

async function networkFirst(req) {
    try {
        const res = await fetch(req);
        if (res.ok) (await caches.open(DYNAMIC_CACHE)).put(req, res.clone());
        return res;
    } catch {
        return caches.match(req) || new Response(JSON.stringify({ error: 'Offline' }), {
            status: 503, headers: { 'Content-Type': 'application/json' }
        });
    }
}