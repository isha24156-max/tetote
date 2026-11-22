
console.log('成功２');

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
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

const ADMIN_UID = "fi2StRZ3mAfkG1clLE5RhSWZpcr2";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const functionStats = document.getElementById("functionStats");

onAuthStateChanged(auth, async (user) => {
    if (!user || user.uid !== ADMIN_UID) {
        await signOut(auth);
        location.href = "./login.html";
        return;
    }

    try {
        const snapshot = await getDocs(collection(db, "usage_logs"));

        // 画面ごとに利用回数を集計
        const screenCounts = {};

        snapshot.forEach((doc) => {
            const log = doc.data();

            if (log.type !== "function_use") {
                return;
            }

            const screen = log.screen || "画面名不明";
            const functionName = log.functionName || "機能名不明";

            if (!screenCounts[screen]) {
                screenCounts[screen] = {};
            }

            screenCounts[screen][functionName] =
                (screenCounts[screen][functionName] || 0) + 1;
        });

        functionStats.replaceChildren();

        const screens = Object.entries(screenCounts);

        if (screens.length === 0) {
            functionStats.textContent = "機能の利用記録はありません。";
            return;
        }

        // 画面ごとに表示
        screens.forEach(([screen, functions]) => {
            const section = document.createElement("div");
            section.className = "function-screen";

            const heading = document.createElement("h3");
            heading.textContent = screen;

            section.appendChild(heading);

            // その画面の機能を表示
            Object.entries(functions)
                .sort((a, b) => b[1] - a[1])
                .forEach(([name, count]) => {
                    const row = document.createElement("div");
                    row.className = "stat-row";

                    const label = document.createElement("span");
                    label.textContent = name;

                    const value = document.createElement("strong");
                    value.textContent = `${count} 回`;

                    row.append(label, value);
                    section.appendChild(row);
                });

            functionStats.appendChild(section);
        });

    } catch (error) {
        console.error("機能ごとの利用回数の取得に失敗しました:", error);
        functionStats.textContent = "利用状況を取得できませんでした。";
    }
});
