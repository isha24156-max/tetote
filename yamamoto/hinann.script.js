const map = L.map('map').setView([35.37, 132.75], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap'
}).addTo(map);

//テスト用の現在地を作る
console.log("位置情報がOFFのため、テスト用位置（出雲市役所）を表示します。");

// テスト用の座標（大津小学校）
const testLat = 35.3752; 
const testLng = 132.7705; 

// 地図をテスト位置へ強制移動
map.setView([testLat, testLng], 15);

// マーカー設置
L.marker([testLat, testLng])
    .addTo(map)
    .bindPopup("現在地（テスト用：大津小学校）") 
    .openPopup();

    // // テスト用の座標（出雲市役所付近）
    // const testLat = 35.3664;
    // const testLng = 132.7554;

    // // 地図をテスト位置へ強制移動
    // map.setView([testLat, testLng], 15);

    // // マーカー設置
    // L.marker([testLat, testLng])
    //     .addTo(map)
    //     .bindPopup("現在地（テスト用：出雲市役所）")
    //     .openPopup();


    
    window.findNearestShelter = function() {
    let nearestShelter = null;
    let minDistance = Infinity; // 一番小さい距離を記録する変数

    // 3つの避難所をループして、現在地からの距離を計算する
    shelters.forEach(function(shelter) {
        // Leafletの機能を使って、現在地と避難所の距離（メートル）を計算
        const distance = map.distance([testLat, testLng], [shelter.lat, shelter.lng]);
        
        // もし今までの最小距離より小さければ、記録を更新
        if (distance < minDistance) {
            minDistance = distance;
            nearestShelter = shelter;
        }
    });

    // 一番近い避難所が見つかったら、そこへのルートを引く
    if (nearestShelter) {
        // 距離を分かりやすくキロメートル（km）かメートル（m）に変換
        let distanceText = minDistance > 1000 
            ? `${(minDistance / 1000).toFixed(1)} km` 
            : `${Math.round(minDistance)} m`;

        // さっき作ったルートを引く関数（setDestination）を自動で実行する
        setDestination(nearestShelter.lat, nearestShelter.lng, nearestShelter.name);
        
        alert(`現在地から一番近い避難所は「${nearestShelter.name}」です。（直線距離: 約 ${distanceText}）`);
    }
};
const shelters = [
    { name: "今市小学校（避難所）", lat: 35.3655, lng: 132.7512 },
    { name: "出雲市民会館（避難所）", lat: 35.3712, lng: 132.7598 },
    { name: "大津コミュニティセンター", lat: 35.3785, lng: 132.7720 }
];

let routingControl = null;

// 道路に沿ったルートを引く関数
window.setDestination = function(destLat, destLng, destName) {
    // 古いルートがあれば消す
    if (routingControl) {
        map.removeControl(routingControl);
    }

    // 道路に沿ってナビの線を引く
    routingControl = L.Routing.control({
        waypoints: [
            L.latLng(testLat, testLng), // 出発地
            L.latLng(destLat, destLng)  // 目的地
        ],
        routeWhileDragging: false,
        addWaypoints: false, 
        draggableWaypoints: false, 
        show: false, 
        lineOptions: {
            styles: [{ color: 'blue', opacity: 0.8, weight: 6 }]
        }
    }).addTo(map);
};

shelters.forEach(function(shelter) {
    const marker = L.marker([shelter.lat, shelter.lng]).addTo(map);
    const popupContent = `
        <strong>${shelter.name}</strong><br>
        <button onclick="setDestination(${shelter.lat}, ${shelter.lng}, '${shelter.name}')" style="margin-top:8px; padding:5px; cursor:pointer;">
            ここへ避難する（ルート表示）
        </button>
    `;
    marker.bindPopup(popupContent);
});