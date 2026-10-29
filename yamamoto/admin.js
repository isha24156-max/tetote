console.log('成功2');

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

const userCount = document.getElementById("userCount");
const pageViewCount = document.getElementById("pageViewCount");
const functionUseCount = document.getElementById("functionUseCount");
const screenStats = document.getElementById("screenStats");
const dailyStats = document.getElementById("dailyStats");
const functionStats = document.getElementById("functionStats");

function showError(message) {
    screenStats.textContent = message;
    dailyStats.textContent = message;
    functionStats.textContent = message;
}

onAuthStateChanged(auth, async (user) => {
    if (!user || user.uid !== ADMIN_UID) {
        await signOut(auth);
        location.href = "./login.html";
        return;
    }

    try {
        const snapshot = await getDocs(collection(db, "usage_logs"));
        const logs = snapshot.docs.map(doc => doc.data());

        const pageViews = logs.filter(log => log.type === "page_view");
        const functionUses = logs.filter(log => log.type === "function_use");

        pageViewCount.textContent = `${pageViews.length} 回`;
        functionUseCount.textContent = `${functionUses.length} 回`;

        // 画面ごとの閲覧数
        const screenCounts = {};
        pageViews.forEach(log => {
            const name = log.screen || "画面名不明";
            screenCounts[name] = (screenCounts[name] || 0) + 1;
        });

        screenStats.replaceChildren();
        if (Object.keys(screenCounts).length === 0) {
            screenStats.textContent = "閲覧記録はありません。";
        } else {
            Object.entries(screenCounts).forEach(([name, count]) => {
                const p = document.createElement("p");
                p.textContent = `${name}：${count} 回`;
                screenStats.appendChild(p);
            });
        }

        // 日別の閲覧数
        const dailyCounts = {};
        pageViews.forEach(log => {
            if (!log.timestamp) return;

            const date = log.timestamp.toDate();
            const key = date.toLocaleDateString("ja-JP", {
                timeZone: "Asia/Tokyo"
            });

            dailyCounts[key] = (dailyCounts[key] || 0) + 1;
        });

        dailyStats.replaceChildren();
        if (Object.keys(dailyCounts).length === 0) {
            dailyStats.textContent = "日別の閲覧記録はありません。";
        } else {
            Object.entries(dailyCounts)
                .sort((a, b) => new Date(b[0]) - new Date(a[0]))
                .forEach(([date, count]) => {
                    const p = document.createElement("p");
                    p.textContent = `${date}：${count} 回`;
                    dailyStats.appendChild(p);
                });
        }

        // 機能ごとの利用回数
        const functionCounts = {};
        functionUses.forEach(log => {
            const name = log.functionName || "機能名不明";
            functionCounts[name] = (functionCounts[name] || 0) + 1;
        });

        functionStats.replaceChildren();
        if (Object.keys(functionCounts).length === 0) {
            functionStats.textContent = "機能の利用記録はありません。";
        } else {
            Object.entries(functionCounts).forEach(([name, count]) => {
                const p = document.createElement("p");
                p.textContent = `${name}：${count} 回`;
                functionStats.appendChild(p);
            });
        }

        const usersSnapshot = await getDocs(collection(db, "users"));
        userCount.textContent = `${usersSnapshot.size} 人`;
    } catch (error) {
        console.error("利用状況の取得に失敗しました:", error);
        showError("データを取得できませんでした。Firestoreのルールを確認してください。");
    }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
    await signOut(auth);
    location.href = "./login.html";
});
