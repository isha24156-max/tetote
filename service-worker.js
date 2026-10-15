
console.log("service-worker.js 読み込み成功5");

// キャッシュのバージョン
const CACHE_NAME = "tetote-cache-v5";

// インストール
self.addEventListener("install", (event) => {
    console.log("Service Worker インストール");
    self.skipWaiting();
});

// 有効化
self.addEventListener("activate", (event) => {
    console.log("Service Worker 有効化");

    event.waitUntil(
        caches.keys()
            .then((cacheNames) => {
                return Promise.all(
                    cacheNames
                        .filter((name) => name !== CACHE_NAME)
                        .map((name) => {
                            console.log("古いキャッシュを削除:", name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// ファイルの読み込み
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") {
        return;
    }

    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // 正常なレスポンスをキャッシュに保存
                if (response.ok) {
                    const responseClone = response.clone();

                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseClone);
                    });
                }

                // ネットから取得した最新版を返す
                return response;
            })
            .catch(() => {
                // ネット接続に失敗した場合はキャッシュを使う
                return caches.match(event.request).then((cachedResponse) => {
                    if (cachedResponse) {
                        return cachedResponse;
                    }

                    // キャッシュにもない場合
                    if (event.request.mode === "navigate") {
                        return new Response(
                            "ページを読み込めません。ネット接続を確認してください。",
                            {
                                status: 503,
                                headers: {
                                    "Content-Type": "text/plain; charset=utf-8"
                                }
                            }
                        );
                    }

                    return Response.error();
                });
            })
    );
});
