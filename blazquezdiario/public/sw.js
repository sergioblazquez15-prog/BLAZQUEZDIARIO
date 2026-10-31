// Service worker mínimo: permite instalar la app. Siempre pide datos frescos al servidor.
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function () {});
