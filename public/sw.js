// No service worker is registered by this app.
// This file prevents noisy 404s from browsers that previously cached a /sw.js registration.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(self.registration.unregister());
});
