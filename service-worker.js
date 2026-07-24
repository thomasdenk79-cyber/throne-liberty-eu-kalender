const CACHE_NAME = "linny-solisium-pulse-v3-1";
const APP_SHELL = [
  "./",
  "./index.html",
  "./config.ini",
  "./live-timers.ini",
  "./manifest.webmanifest",
  "./assets/icons/linny-192.png",
  "./assets/icons/linny-512.png",
  "./assets/images/linny/linny-hero-v2.webp",
  "./assets/events/themes/time-vortex/linny-time-lady-gallifrey-v1.webp",
  "./assets/events/linny-arkeum-invasion-v1.webp",
  "./assets/events/linny-gate-memory-v1.webp",
  "./assets/events/linny-summer-festival-v1.webp",
  "./assets/events/linny-archboss-v1.webp",
  "./assets/events/linny-castle-pvp-v1.webp",
  "./assets/events/linny-guild-raid-v1.webp",
  "./assets/events/linny-amitoi-home-v1.webp"
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;

  const networkFirst = url.pathname.endsWith("/")
    || url.pathname.endsWith("/index.html")
    || url.pathname.endsWith("/config.ini")
    || url.pathname.endsWith("/live-timers.ini")
    || url.pathname.endsWith("/manifest.webmanifest");
  if (networkFirst) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request).then((response) => {
      if (response.ok) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
      }
      return response;
    }))
  );
});
