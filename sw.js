const CACHE = 'yadong-blog-v2';
const ASSETS = ['/', '/index.html', '/favicon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  // 文章 JSON 和 PNG 图片：缓存优先，后台更新
  if (url.pathname.endsWith('.json') || url.pathname.endsWith('.svg') || url.pathname.match(/\.(png|jpg|jpeg|webp|mp4)$/)) {
    e.respondWith(caches.open(CACHE).then(async cache => {
      const cached = await cache.match(e.request);
      const fetchPromise = fetch(e.request).then(response => {
        if (response.ok) cache.put(e.request, response.clone());
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    }));
    return;
  }
  // HTML 和网络资源：网络优先，fallback 缓存
  e.respondWith(
    fetch(e.request).then(r => { if (r.ok) caches.open(CACHE).then(c => c.put(e.request, r.clone())); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match('/')))
  );
});
