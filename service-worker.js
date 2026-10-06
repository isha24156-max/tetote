const CACHE_NAME = "tetote-cache-v3";


// ==============================
// Service Workerをインストール
// ==============================

self.addEventListener("install", (event) => {

    console.log("Service Worker インストール");

    // 新しいService Workerをすぐに有効にする
    self.skipWaiting();

});


// ==============================
// Service Workerを有効化
// ==============================

self.addEventListener("activate", (event) => {

    console.log("Service Worker 有効化");

    event.waitUntil(

        caches.keys().then((cacheNames) => {

            return Promise.all(

                cacheNames

                    // 今使っているキャッシュ以外を削除
                    .filter((name) => name !== CACHE_NAME)

                    .map((name) => caches.delete(name))

            );

        })

    );

    // すぐにページを管理する
    self.clients.claim();

});


// ==============================
// ページを読み込む
// ==============================

self.addEventListener("fetch", (event) => {

    // GET以外は処理しない
    if (event.request.method !== "GET") {
        return;
    }


    // ==============================
    // HTMLページの場合
    // ==============================
    // インターネットから最新のページを取得する
    // オフラインの場合はキャッシュを使う

    if (event.request.mode === "navigate") {

        event.respondWith(

            fetch(event.request)

                .then((response) => {

                    // 最新のページをキャッシュにも保存
                    const responseClone =
                        response.clone();

                    caches.open(CACHE_NAME)
                        .then((cache) => {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                    // 最新のページを表示
                    return response;

                })

                .catch(() => {

                    // インターネットにつながらない場合
                    // キャッシュしたページを表示

                    return caches.match(
                        event.request
                    );

                })

        );

        return;
    }


    // ==============================
    // CSS・JavaScript・画像など
    // ==============================

    event.respondWith(

        caches.match(event.request)

            .then((cachedResponse) => {

                // キャッシュがあれば使う
                if (cachedResponse) {

                    return cachedResponse;

                }


                // キャッシュがなければ
                // インターネットから取得

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
