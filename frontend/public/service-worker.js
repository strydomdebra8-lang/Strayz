/* Strayz minimal PWA service worker — offline shell + portrait caching.
   Keeps it simple so we don't interfere with React Router or API calls. */
const CACHE = "strayz-v1";
const PRECACHE_URLS = [
  "/",
  "/manifest.json",
  "/icons/icon-192.png",
  "/icons/icon-512.png",
  "/icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => null)
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Never cache API calls or non-same-origin requests.
  if (url.pathname.startsWith("/api/") || url.origin !== self.location.origin) return;

  // Cache-first for portraits + icons.
  if (url.pathname.startsWith("/portraits/") || url.pathname.startsWith("/icons/")) {
    event.respondWith(
      caches.match(req).then((cached) =>
        cached ||
        fetch(req).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
          return res;
        })
      )
    );
    return;
  }

  // Network-first for HTML navigation (so updates are picked up), fall back to cache when offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() => caches.match("/").then((c) => c || Response.error()))
    );
  }
});
