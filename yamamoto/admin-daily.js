console.log('成功１');

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    getFirestore,
    collection,
    getDocs
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyA6stEZ00HAtMNEvUzG47zIUArCFJgsfTA",
    authDomain: "tetote-f459b.firebaseapp.com",
    projectId: "tetote-f459b",
    storageBucket: "tetote-f459b.firebasestorage.app",
    messagingSenderId: "4402684573",
    appId: "1:4402684573:web:09529c707357ce437dea74",
    measurementId: "G-CSGLSRBLDR"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ADMIN_UID = "fi2StRZ3mAfkG1clLE5RhSWZpcr2";
const dailyStats = document.getElementById("dailyStats");

onAuthStateChanged(auth, async (user) => {
    if (!user || user.uid !== ADMIN_UID) {
        await signOut(auth);
        location.href = "./login.html";
        return;
    }

    try {
        const snapshot = await getDocs(collection(db, "usage_logs"));

        const logs = snapshot.docs.map(doc => doc.data());

        const pageViews = logs.filter(
            log => log.type === "page_view" && log.timestamp
        );

        const dailyCounts = {};

        pageViews.forEach(log => {
            const date = log.timestamp.toDate();

            const key = new Intl.DateTimeFormat("sv-SE", {
                timeZone: "Asia/Tokyo",
                year: "numeric",
                month: "2-digit",
                day: "2-digit"
            }).format(date);

            dailyCounts[key] = (dailyCounts[key] || 0) + 1;
        });

        dailyStats.replaceChildren();

        // 今月の日付を取得
        const now = new Date();
        
        const year = now.getFullYear();
        const month = now.getMonth();
        
        // 今月の1日から末日までの日付を作成
        const lastDay = new Date(year, month + 1, 0).getDate();
        
        const dates = [];
        
        for (let day = 1; day <= lastDay; day++) {
            const date =
                `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
        
            dates.push(date);
        }
        
        // 日付ごとの閲覧数。記録がない日は0回
        const chartCounts = dates.map(date => dailyCounts[date] || 0);
        
        // グラフの横軸の日付
        const chartDates = dates.map(date => {
            const day = Number(date.slice(8, 10));
        
            // 5日おきと月末だけ日付を表示
            if (day === 1 || day % 5 === 0 || day === lastDay) {
                return `${day}日`;
            }
        
            return "";
        });

        const canvas = document.getElementById("dailyChart");
        if (!canvas) {
            console.error("dailyChartが見つかりません");
            return;
        }
        const ctx = canvas.getContext("2d");
        
        new Chart(ctx, {
            type: "line",
        
            data: {
                labels: chartDates,
        
                datasets: [{
                    label: "利用回数",
                    data: chartCounts,
        
                    borderColor: "#65c77d",
                    backgroundColor: "#65c77d",
        
                    borderWidth: 3,
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    pointHitRadius: 20,
        
                    pointBackgroundColor: "#65c77d",
                    pointBorderColor: "#ffffff",
                    pointBorderWidth: 2,
        
                    tension: 0
                }]
            },
        
            options: {
                responsive: true,
                maintainAspectRatio: false,
        
                interaction: {
                    mode: "nearest",
                    intersect: false
                },
        
                plugins: {
                    legend: {
                        display: false
                    },
        
                    tooltip: {
                        enabled: true,
        
                        callbacks: {
                            title: function(items) {
                                const date = dates[items[0].dataIndex];
                                return date.replaceAll("-", "/");
                            },
        
                            label: function(context) {
                                return `● 利用回数　${context.raw}回`;
                            }
                        }
                    }
                },
        
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxRotation: 0,
                            minRotation: 0
                        }
                    },
        
                    y: {
                        beginAtZero: true,
        
                        ticks: {
                            precision: 0,
        
                            callback: function(value) {
                                return `${value}回`;
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error("日別閲覧数の取得に失敗しました:", error);
        dailyStats.textContent =
            "データを取得できませんでした。Firestoreのルールを確認してください。";
    }
});
