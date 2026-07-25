const CACHE_NAME = "linny-epic-time-portal-v3-3-5";
const APP_SHELL = [
  "./",
  "./index.html",
  "./assets/styles/app.css?v=3.3.4",
  "./assets/js/app.js?v=3.3.4",
  "./assets/js/config.js",
  "./assets/js/i18n.js",
  "./assets/js/ics.js",
  "./assets/js/schedule.js",
  "./assets/js/sounds.js",
  "./config.ini",
  "./live-timers.ini",
  "./manifest.webmanifest?v=3.3.4",
  "./assets/icons/linny-192.png",
  "./assets/icons/linny-512.png",
  "./assets/images/linny/linny-hero-v2.webp",
  "./assets/legal/linny-imprint-v1.webp",
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
    || url.pathname.endsWith("/assets/styles/app.css")
    || url.pathname.endsWith("/assets/js/app.js")
    || url.pathname.endsWith("/assets/js/config.js")
    || url.pathname.endsWith("/assets/js/i18n.js")
    || url.pathname.endsWith("/assets/js/ics.js")
    || url.pathname.endsWith("/assets/js/schedule.js")
    || url.pathname.endsWith("/assets/js/sounds.js")
    || url.pathname.endsWith("/config.ini")
    || url.pathname.endsWith("/live-timers.ini")
    || url.pathname.endsWith("/manifest.webmanifest");
  if (networkFirst) {
    event.respondWith(
      fetch(event.request)
        .then(async (response) => {
          if (response.ok) {
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(event.request);
          return cached || new Response("Offline and no cached response is available.", {
            status: 503,
            headers: { "Content-Type": "text/plain; charset=utf-8" }
          });
        })
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
