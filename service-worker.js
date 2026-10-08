// ========================================
// キャッシュのバージョン
// ========================================

const CACHE_NAME = "tetote-cache-v4";


// ========================================
// インストール
// ========================================

self.addEventListener("install", (event) => {

    console.log("Service Worker インストール");

    // 新しいService Workerをすぐに有効にする
    self.skipWaiting();

});


// ========================================
// 有効化
// ========================================

self.addEventListener("activate", (event) => {

    console.log("Service Worker 有効化");

    event.waitUntil(

        caches.keys().then((cacheNames) => {

            return Promise.all(

                cacheNames

                    // 今のキャッシュ以外を削除
                    .filter((name) => name !== CACHE_NAME)

                    .map((name) => {

                        console.log(
                            "古いキャッシュを削除:",
                            name
                        );

                        return caches.delete(name);

                    })

            );

        }).then(() => {

            // 現在開いているページも
            // 新しいService Workerの管理下にする
            return self.clients.claim();

        })

    );

});


// ========================================
// ファイルの読み込み
// ========================================

self.addEventListener("fetch", (event) => {

    // GET以外は何もしない
    if (event.request.method !== "GET") {
        return;
    }


    // ========================================
    // HTMLページ
    // ========================================

    if (event.request.mode === "navigate") {

        event.respondWith(

            fetch(event.request)

                .then((response) => {

                    // 新しいHTMLをキャッシュ
                    const responseClone = response.clone();

                    caches.open(CACHE_NAME).then((cache) => {

                        cache.put(
                            event.request,
                            responseClone
                        );

                    });

                    return response;

                })

                .catch(() => {

                    // ネットが使えない場合はキャッシュを使う
                    return caches.match(event.request);

                })

        );

        return;
    }


    // ========================================
    // CSS・JS・画像など
    // ========================================

    event.respondWith(

        caches.match(event.request)

            .then((cachedResponse) => {

                // キャッシュがあれば使用
                if (cachedResponse) {

                    return cachedResponse;

                }


                // キャッシュになければネットから取得
                return fetch(event.request)

                    .then((response) => {

                        // 正常なレスポンスだけ保存
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
