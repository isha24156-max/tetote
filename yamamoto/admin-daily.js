
console.log("成功１");

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

// Firebase設定は現在のものをそのまま残す
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
const canvas = document.getElementById("dailyChart");
const monthLabel = document.getElementById("monthLabel");
const prevMonthButton = document.getElementById("prevMonth");
const nextMonthButton = document.getElementById("nextMonth");

let dailyChart = null;
let dailyCounts = {};

// 日本時間で現在の年月を取得
const todayParts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric"
}).formatToParts(new Date());

const currentYear = Number(
    todayParts.find(part => part.type === "year").value
);

const currentMonth = Number(
    todayParts.find(part => part.type === "month").value - 1
);

// 最初は今月を表示
let selectedYear = currentYear;
let selectedMonth = currentMonth;


// 月ごとのグラフを表示する関数
function renderDailyChart() {

    const lastDay = new Date(
        selectedYear,
        selectedMonth + 1,
        0
    ).getDate();

    const dates = [];

    // 1日から月末までの日付を作成
    for (let day = 1; day <= lastDay; day++) {

        const date =
            `${selectedYear}-${String(selectedMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

        dates.push(date);
    }

    // 記録がない日は0回
    const chartCounts = dates.map(
        date => dailyCounts[date] || 0
    );

    // 5日おきと月末だけ日付を表示
    const chartDates = dates.map((date, index) => {

        const day = index + 1;

        if (day === 1 || day % 5 === 0 || day === lastDay) {
            return `${day}日`;
        }

        return "";
    });

    // 月の表示
    monthLabel.textContent =
        `${selectedYear}年${selectedMonth + 1}月`;

    // 未来の月には進めない
    const selectedMonthValue =
        selectedYear * 12 + selectedMonth;

    const currentMonthValue =
        currentYear * 12 + currentMonth;

    nextMonthButton.disabled =
        selectedMonthValue >= currentMonthValue;

    // 以前のグラフを削除
    if (dailyChart) {
        dailyChart.destroy();
    }

    const ctx = canvas.getContext("2d");

    dailyChart = new Chart(ctx, {

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
                        minRotation: 0,
                        autoSkip: false
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
}


// 前月ボタン
prevMonthButton.addEventListener("click", () => {

    const previous = new Date(
        selectedYear,
        selectedMonth - 1,
        1
    );

    selectedYear = previous.getFullYear();
    selectedMonth = previous.getMonth();

    renderDailyChart();
});


// 翌月ボタン
nextMonthButton.addEventListener("click", () => {

    const next = new Date(
        selectedYear,
        selectedMonth + 1,
        1
    );

    selectedYear = next.getFullYear();
    selectedMonth = next.getMonth();

    renderDailyChart();
});


// 管理者確認
onAuthStateChanged(auth, async (user) => {

    if (!user || user.uid !== ADMIN_UID) {
        await signOut(auth);
        location.href = "./login.html";
        return;
    }

    try {

        const snapshot = await getDocs(
            collection(db, "usage_logs")
        );

        const logs = snapshot.docs.map(doc => doc.data());

        const pageViews = logs.filter(
            log => log.type === "page_view" && log.timestamp
        );

        dailyCounts = {};

        // 日付ごとに閲覧数を集計
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

        dailyStats.textContent = "";

        if (!canvas) {
            console.error("dailyChartが見つかりません");
            return;
        }

        // 今月のグラフを表示
        renderDailyChart();

    } catch (error) {

        console.error("日別閲覧数の取得に失敗しました:", error);

        dailyStats.textContent =
            "データを取得できませんでした。Firestoreのルールを確認してください。";
    }
});
