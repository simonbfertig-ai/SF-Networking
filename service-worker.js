const CACHE_NAME = "simon-networking-cloud-crm-data-v1";
const ASSETS = ["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js","https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS).catch(()=>null))); self.skipWaiting(); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null)))); self.clients.claim(); });
self.addEventListener("fetch", e => { e.respondWith(fetch(e.request).then(r => { const copy = r.clone(); caches.open(CACHE_NAME).then(c => c.put(e.request, copy)).catch(()=>{}); return r; }).catch(() => caches.match(e.request).then(cached => cached || caches.match("./index.html")))); });
