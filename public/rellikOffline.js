// google video: https://www.youtube.com/watch?v=7jsg1Mb7PB4
// guys video: https://www.youtube.com/watch?v=rxQJtPnZUMY
const cacheName = "RellikCache";
const filesToCache = [
    "all-rellik-files"
];
self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(cacheName).then(function(cache) {
            return cache.addAll(filesToCache);
        }).then(function() {
            return self.skipWaiting();
        })
    );
}); // google video

self.addEventListener("activate", function(event) {
    event.waitUntil(
        caches.keys().then(keyList => {
            return Promise.all(keyList.map(key => {
                if (key !== cacheName) {
                    return caches.delete(key);
                }
            }));
    }));
    return self.clients.claim();
}); // google video

// self.addEventListener("fetch", function(event) {
//     event.respondWith(
//         caches.match(event.request)
//         .then(function(response) {
//             return response || fetch(event.request);
//         })
//     );
// }); // google video

self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.open(cacheName).then(function(cache) {
            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request).then(function(response) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
}); // https://developer.mozilla.org/en-US/docs/Web/API/CacheStorage/open



// async function preCache() {
//     const cache = await caches.open(cacheName);
//     return cache.addAll(filesToCache);
// } // guys video

// self.addEventListener("install", event => {
//     console.log("the cache has been install");
//     self.skipWaiting();
//     event.waitUntil(preCache());
// }); // guys video

// async function cleanupCache() {
//     const keys = await caches.keys();
//     const keysToDelete = keys.map(key => {
//         if (key !== cacheName) {
//             return caches.delete(key);
//         }
//     })
//     return Promise.all(keysToDelete);
// } // guys video

// self.addEventListener("activate", event => {
//     console.log("the cache has been activate");
//     event.waitUntil(cleanupCache());
// }); // guys video

// async function fetchAssets(event) {
//     try {
//         const response = fetch(event.request);
//         return response;
//     } catch (err) {
//         const cache = await caches.open(cacheName);
//         return cache.match(event.request);
//     }
// } // guys video

// self.addEventListener("fetch", event => {
//     console.log("the cache has been fetch");
//     event.respondWith(fetchAssets(event));
// }); // guys video