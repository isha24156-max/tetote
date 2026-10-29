console.log('成功1');

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

        const counts = {};

        snapshot.forEach((doc) => {
            const log = doc.data();

            if (log.type === "function_use") {
                const name = log.functionName || "機能名不明";
                counts[name] = (counts[name] || 0) + 1;
            }
        });

        const functions = Object.entries(counts)
            .sort((a, b) => b[1] - a[1]);

        if (functions.length === 0) {
            functionStats.textContent = "機能の利用記録はありません。";
            return;
        }

        functionStats.replaceChildren();

        functions.forEach(([name, count]) => {
            const row = document.createElement("div");
            row.className = "stat-row";

            const label = document.createElement("span");
            label.textContent = name;

            const value = document.createElement("strong");
            value.textContent = `${count} 回`;

            row.append(label, value);
            functionStats.appendChild(row);
        });

    } catch (error) {
        console.error("機能ごとの利用回数の取得に失敗しました:", error);
        functionStats.textContent = "利用状況を取得できませんでした。";
    }
});
