self.addEventListener("fetch", fetchEvent => {
  if (fetchEvent.request.url.search('.amazonaws.com') !== -1) {
    fetchEvent.respondWith(
      caches.match(fetchEvent.request).then(res => {
        return res || fetch(fetchEvent.request)
      })
    );
  }
});

// Create cache store
let cacheName = 'digital-twin-cache-v1';
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.addAll(
        [
          'https://criskle-uploads.s3.eu-west-2.amazonaws.com/3d-models/Vehicle-Model-1/named_v.glb',
        ]
      );
    })
  );
});
