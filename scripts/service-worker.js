/* Generated as public/sw.js after each production build. */
const CACHE_PREFIX = "limitation-pwa-";
const CACHE_NAME = CACHE_PREFIX + "__CACHE_VERSION__";
const PRECACHE = __PRECACHE_ASSETS__;

self.addEventListener("install", event => {
  // Only mark the app offline-ready once ALL chunks, including PDF export, exist.
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(PRECACHE)));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const key of await caches.keys()) {
      if (key.startsWith(CACHE_PREFIX) && key !== CACHE_NAME) await caches.delete(key);
    }
    await self.clients.claim();
  })());
});

self.addEventListener("message", event => {
  // Updates require an explicit user action; don't reload an in-progress case.
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", event => {
  const request = event.request;
  const url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;

  if (request.mode === "navigate" && url.pathname === "/") {
    event.respondWith((async () => {
      const cache = await caches.open(CACHE_NAME);
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4000);
      try {
        const response = await fetch(request, { signal: controller.signal });
        if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) throw new Error("Navigation unavailable");
        await cache.put("/", response.clone());
        return response;
      } catch {
        return (await cache.match("/")) || Response.error();
      } finally {
        clearTimeout(timer);
      }
    })());
    return;
  }

  // Never cache APIs, RSC responses, form submissions or third-party sharing.
  if (!PRECACHE.includes(url.pathname) || url.pathname === "/" || url.search) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(url.pathname);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(url.pathname, response.clone());
    return response;
  })());
});
