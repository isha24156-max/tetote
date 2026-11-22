console.log('成功1');

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
const screenStats = document.getElementById("screenStats");

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
            log => log.type === "page_view"
        );

        const screenCounts = {};

        pageViews.forEach(log => {
            const name = log.screen || "画面名不明";
            screenCounts[name] = (screenCounts[name] || 0) + 1;
        });

        screenStats.replaceChildren();

        const functions = Object.entries(screenCounts)
            .sort((a, b) => b[1] - a[1]);
        
        if (functions.length === 0) {
            screenStats.textContent = "閲覧記録はありません。";
            return;
        }
        
        // 最も閲覧回数が多い画面を基準にする
        const maxCount = functions[0][1];
        
        // 画面ごとの表示
        functions.forEach(([name, count]) => {
        
            const item = document.createElement("div");
            item.className = "screen-stat-item";
        
            // 画面名と回数
            const top = document.createElement("div");
            top.className = "screen-stat-top";
        
            const nameElement = document.createElement("span");
            nameElement.className = "screen-stat-name";
            nameElement.textContent = name;
        
            const countElement = document.createElement("strong");
            countElement.className = "screen-stat-count";
            countElement.textContent = `${count}回`;
        
            top.append(nameElement, countElement);
        
            // 横棒グラフ
            const bar = document.createElement("div");
            bar.className = "screen-stat-bar";
        
            const fill = document.createElement("div");
            fill.className = "screen-stat-fill";
        
            fill.style.width = `${(count / maxCount) * 100}%`;
        
            bar.appendChild(fill);
        
            item.append(top, bar);
            screenStats.appendChild(item);
        });

    } catch (error) {
        console.error("画面閲覧数の取得に失敗しました:", error);
        screenStats.textContent =
            "データを取得できませんでした。Firestoreのルールを確認してください。";
    }
});
