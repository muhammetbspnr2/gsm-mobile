"use strict";
const VERSION = "2.0.4";
const CACHE_NAME = "gsm-takip-" + VERSION;
const SHELL = ["", "index.html", "admin.html", "style.css", "app.js", "admin.js", "site-import.js", "firebase-config.js", "pwa.js", "manifest.webmanifest", "app-icon.svg"];
const shellUrl = path => new URL(path, self.registration.scope).href;
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await cache.addAll(SHELL.map(shellUrl));
    await self.skipWaiting();
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(key => key.startsWith("gsm-takip-") && key !== CACHE_NAME).map(key => caches.delete(key)));
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(request);
      if (response && response.ok && response.type === "basic") {
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(request, { ignoreSearch: true });
      if (cached) return cached;
      if (request.mode === "navigate") {
        const fallback = await cache.match(shellUrl("index.html"), { ignoreSearch: true });
        if (fallback) return fallback;
      }
      throw error;
    }
  })());
});
