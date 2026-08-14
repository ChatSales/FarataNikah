// Minimal service worker with a single job: when a page navigation fails
// because the browser has no network (the case a plain React component
// can never handle, since JS never runs if the navigation itself fails),
// serve the cached offline.html instead of the browser's generic error
// interstitial. Everything else (assets, API calls, server actions) is
// left untouched — this is not a full offline-first/PWA cache strategy.
const CACHE_NAME = "farata-offline-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() =>
      caches.open(CACHE_NAME).then((cache) => cache.match(OFFLINE_URL))
    )
  );
});
