
console.log("成功３");

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
const logoutBtn = document.getElementById("logoutBtn");

onAuthStateChanged(auth, async (user) => {
    if (!user || user.uid !== ADMIN_UID) {
        await signOut(auth);
        location.href = "./login.html";
        return;
    }

    try {
        // 利用記録を取得
        const snapshot = await getDocs(
            collection(db, "usage_logs")
        );

        const logs = snapshot.docs.map(doc => doc.data());

        // 総画面閲覧数
        const pageViews = logs.filter(
            log => log.type === "page_view"
        );

        pageViewCount.textContent = `${pageViews.length} 回`;

        // 総機能利用回数
        const functionUses = logs.filter(
            log => log.type === "function_use"
        );

        functionUseCount.textContent = `${functionUses.length} 回`;

        // 登録ユーザー数
        const usersSnapshot = await getDocs(
            collection(db, "users")
        );

        userCount.textContent = `${usersSnapshot.size} 人`;

    } catch (error) {
        console.error("利用状況の取得に失敗しました:", error);

        if (userCount) {
            userCount.textContent = "取得失敗";
        }

        if (pageViewCount) {
            pageViewCount.textContent = "取得失敗";
        }

        if (functionUseCount) {
            functionUseCount.textContent = "取得失敗";
        }
    }
});

if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
        await signOut(auth);
        location.href = "./login.html";
    });
}
