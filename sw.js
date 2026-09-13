// Service Worker para Sistema Universitario PWA
const CACHE_NAME = "sistema-univ-v1";
const ASSETS = [
  "./",
  "./index.html",
  "./styles.css",
  "./pensumData.js",
  "./app.js",
  "./icon.jpg",
  "./manifest.json"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request);
    })
  );
});
