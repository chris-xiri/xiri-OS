// xiriOS Service Worker – cache-first for assets, network-first for API calls
const CACHE_NAME = "xiri-os-v1";
const PRECACHE_URLS = ["/app/", "/app/index.html"];

// Install — precache shell
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache-first for static assets, network-first for everything else
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET and external requests
  if (event.request.method !== "GET" || url.origin !== location.origin) return;

  // Static assets (JS, CSS, images, fonts) → cache-first
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2?|ttf|eot)$/)) {
    event.respondWith(
      caches.match(event.request).then(
        (cached) => cached || fetch(event.request).then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
      )
    );
    return;
  }

  // HTML navigations → network-first with offline fallback
  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/app/index.html"))
    );
    return;
  }
});
