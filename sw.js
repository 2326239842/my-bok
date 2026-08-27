// yadong-blog Service Worker v3
// 策略要点：
//  1) HTML/导航请求：网络优先，永不回退"旧骨架缓存"（白屏元凶）。
//     仅当浏览器判定离线(navigator.onLine===false)时才回退最近一次成功缓存的 HTML。
//  2) 文章 JSON articles-content.json：网络优先 + 缓存兜底(stale-while-revalidate)，
//     避免返回过期的文章数据导致渲染异常。
//  3) 静态资源(png/jpg/webp/svg/mp4/ogg/woff2)：缓存优先 + 后台更新(离线可用)。
//  4) 每次有新版 SW 立即 skipWaiting + claim 接管，并将 CACHE 名升版以清理旧缓存。
const CACHE = 'yadong-blog-v4';

// 安装时只预缓存 favicon 等极少数固定资源；不预缓存 '/' 或 index.html，
// 避免把"旧骨架"固化进缓存（这正是刷新才好、不刷新白的根因）。
const PRECACHE = ['/favicon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(PRECACHE))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .catch(() => {})
  );
  self.clients.claim();
});

const NAV_RE = /^https?:\/\//i;

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  // 仅处理同源资源
  if (url.origin !== location.origin) return;

  const path = url.pathname;

  // ---- 导航请求（HTML）：网络优先，离线才回退缓存 ----
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            // 缓存这次成功的 HTML 作为离线 fallback
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put('offline-html', clone)).catch(() => {});
          }
          return res;
        })
        .catch(() =>
          caches.match('offline-html').then(r => r || caches.match('/'))
        )
    );
    return;
  }

  // ---- 文章 JSON（articles-content.json 等）：网络优先 + 缓存兜底 ----
  if (path.endsWith('.json')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {});
          }
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('offline-html').then(h => h || Response.error())))
    );
    return;
  }

  // ---- 静态资源（图片/视频/音频）：缓存优先 + 后台更新 ----
  if (path.match(/\.(png|jpg|jpeg|webp|gif|svg|mp4|mp3|ogg|woff2?|css|js)$/i)) {
    e.respondWith(
      caches.match(req).then(cached => {
        const network = fetch(req).then(res => {
          if (res && res.ok) {
            const clone = res.clone();
            caches.open(CACHE).then(c => c.put(req, clone)).catch(() => {});
          }
          return res;
        }).catch(() => cached);
        return cached || network;
      })
    );
    return;
  }
});
