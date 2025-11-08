// Çevrimdışı önbellek için bir isim tanımlayalım
const CACHE_NAME = 'tk-mevzuat-cache-v1';

// Önbelleğe alınacak temel dosyalar (sitenizdeki ana dosyaları buraya ekleyebilirsiniz)
const urlsToCache = [
  '/tkmevzuat/',
  '/tkmevzuat/index.html',
  // Sitenizdeki diğer önemli CSS, JS veya resim dosyalarını buraya ekleyin
  // Örn: '/tkmevzuat/style.css',
  // Örn: '/tkmevzuat/app.js'
];

// 1. Install (Yükleme) olayı: Service worker yüklendiğinde tetiklenir
self.addEventListener('install', (event) => {
  // Yükleme işlemi, önbelleğin açılmasını ve dosyaların eklenmesini bekler
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Önbellek açıldı');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Fetch (Getirme) olayı: Sayfa bir kaynak (resim, script, sayfa) istediğinde tetiklenir
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Eğer istenen kaynak önbellekte varsa, doğrudan önbellekten döndür
        if (response) {
          return response;
        }

        // Önbellekte yoksa, ağı kullanarak iste
        return fetch(event.request).then(
          (response) => {
            // İsteği başarıyla aldıysak
            // İsteği klonla (response sadece bir kez okunabilir)
            let responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then((cache) => {
                // İsteği önbelleğe al
                cache.put(event.request, responseToCache);
              });
            // Orijinal yanıtı sayfaya döndür
            return response;
          }
        );
      }
    )
  );
});

// 3. Activate (Aktifleşme) olayı: Eski service worker'lar temizlenir
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Eğer bu önbellek bizim güncel beyaz listemizde yoksa, sil
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});