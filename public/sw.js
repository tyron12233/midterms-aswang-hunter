const CACHE_VERSION = 'v1';
const CACHE_NAME = `sangubat-assets-${CACHE_VERSION}`;

const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/assets/bg.png',
  '/assets/start.png',
  '/assets/askAlbularyo.png',
  '/assets/askCaptain.png',
  '/assets/oldChurch_entry.png',
  '/assets/altar.jpeg',
  '/assets/ricefields_entry.jpeg',
  '/assets/investigateTiyanak.jpeg',
  '/assets/finalFight_approach.jpeg',
  '/assets/finalFight_direct.png',
  '/assets/finalFight_search.png',
  '/assets/wakwak_jumpscare.jpeg',
  '/assets/wakwak_noGarlic.png',
  '/assets/wakwak_useGarlic.jpeg',
  '/assets/goodEnding.jpeg',
  '/assets/badEnding_noSalt.jpeg',
  '/assets/gameOver_noHp.jpeg',
  '/assets/sfx/bg-music.mp3',
  '/assets/sfx/jumpscare-1.mp3',
  '/assets/sfx/typewriter-sound-effect-312919.mp3',
  '/assets/sfx/single_key_type.wav',
  '/assets/sfx/single_key_type_2.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key.startsWith('sangubat-assets-') && key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) {
    return;
  }

  if (url.pathname === '/' || url.pathname === '/index.html') {
    event.respondWith(networkFirst(request));
    return;
  }

  if (url.pathname.startsWith('/assets/')) {
    event.respondWith(cacheFirst(request));
  }
});

async function cacheFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached) {
    return cached;
  }

  const response = await fetch(request);
  if (response && response.ok) {
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
    return response;
  } catch (error) {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) {
      return cached;
    }
    throw error;
  }
}
