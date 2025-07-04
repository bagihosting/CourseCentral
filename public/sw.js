// Nama cache, ubah versi jika ada pembaruan besar pada aset
const CACHE_NAME = 'course-app-cache-v1';
// Daftar URL yang akan dicache saat instalasi
const urlsToCache = [
  '/',
  '/dashboard',
  '/manifest.json',
  '/icon.svg',
];

// Event listener untuk proses instalasi service worker
self.addEventListener('install', (event) => {
  // Menunggu hingga proses caching selesai
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Cache dibuka');
        return cache.addAll(urlsToCache);
      })
  );
});

// Event listener untuk setiap permintaan fetch dari aplikasi
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Jika permintaan ada di cache, kembalikan dari cache
        if (response) {
          return response;
        }

        // Jika tidak ada di cache, lakukan permintaan jaringan
        const fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          (response) => {
            // Jika respons tidak valid, langsung kembalikan
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Simpan respons yang valid ke dalam cache
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
  );
});

// Event listener untuk aktivasi service worker (membersihkan cache lama)
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
