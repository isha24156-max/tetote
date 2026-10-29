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

        const dates = Object.keys(dailyCounts).sort(
            (a, b) => b.localeCompare(a)
        );

        if (dates.length === 0) {
            dailyStats.textContent = "閲覧記録はありません。";
            return;
        }

        dates.forEach(date => {
            const item = document.createElement("div");
            item.className = "stat-row";

            const dateElement = document.createElement("span");
            dateElement.textContent = date.replaceAll("-", "/");

            const countElement = document.createElement("strong");
            countElement.textContent = `${dailyCounts[date]} 回`;

            item.append(dateElement, countElement);
            dailyStats.appendChild(item);
        });

    } catch (error) {
        console.error("日別閲覧数の取得に失敗しました:", error);
        dailyStats.textContent =
            "データを取得できませんでした。Firestoreのルールを確認してください。";
    }
});
