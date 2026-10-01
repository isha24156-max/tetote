const CACHE_NAME = "tetote-cache-v2";


// Service Workerをインストール
self.addEventListener("install", (event) => {

    console.log("Service Worker インストール");

    self.skipWaiting();

});


// Service Workerを有効化
self.addEventListener("activate", (event) => {

    console.log("Service Worker 有効化");

    event.waitUntil(
        caches.keys().then((cacheNames) => {

            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );

        })
    );

    self.clients.claim();

});


// ページを読み込む
self.addEventListener("fetch", (event) => {

    // GET以外はそのまま
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(

        caches.match(event.request)
            .then((cachedResponse) => {

                // キャッシュがあればそれを使う
                if (cachedResponse) {
                    return cachedResponse;
                }

                // なければインターネットから取得
                return fetch(event.request)
                    .then((response) => {

                        // 正常なレスポンスなら保存
                        if (response.ok) {

                            const responseClone =
                                response.clone();

                            caches.open(CACHE_NAME)
                                .then((cache) => {
                                    cache.put(
                                        event.request,
                                        responseClone
                                    );
                                });

                        }

                        return response;

                    });

            })

    );

});
