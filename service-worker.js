const CACHE_NAME = "dilshaj-portfolio-shell-v17";
const APP_SHELL = [
  "./",
  "./index.html",
  "./resume.html",
  "./manifest.webmanifest",
  "./assets/favicon.svg",
  "./assets/earth.svg",
  "./assets/earth-clouds.svg",
  "./assets/moon.svg",
  "./assets/app-icon-192.png",
  "./assets/app-icon-512.png",
  "./assets/dilshaj-face-cropped.jpg"
];

async function cacheResponse(request, response) {
  if (!response.ok) return response;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  } catch (error) {
    console.warn("Offline cache update failed:", error.message);
  }
  return response;
}

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => Promise.all(
        cacheNames
          .filter((cacheName) => cacheName.startsWith("dilshaj-portfolio-") && cacheName !== CACHE_NAME)
          .map((cacheName) => caches.delete(cacheName))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  const requestUrl = new URL(request.url);
  if (request.method !== "GET" || requestUrl.origin !== self.location.origin) return;
  if (request.headers.has("range") || request.destination === "audio" || request.destination === "video") return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => cacheResponse(request, response))
        .catch(async () => (await caches.match(request)) || caches.match("./index.html"))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(request).then((response) => cacheResponse(request, response));
    })
  );
});
