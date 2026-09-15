import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    addDoc,
    collection,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey:  "AIzaSyA6stEZ00HAtMNEuV...",
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


// 「無事です」を送信
async function sendSafetyMail() {

    const confirmSend = confirm(
        "登録している連絡先に「無事です」と送信しますか？"
    );

    if (!confirmSend) {
        return;
    }

    // ログインしているユーザーを取得
    const user = auth.currentUser;

    if (!user) {
        alert("ログインしてください。");
        return;
    }

    try {

        // users/{UID} から名前を取得
        const userDoc = await getDoc(
            doc(db, "users", user.uid)
        );

        const userData = userDoc.data();

        const name = userData?.name || "利用者";

        // 安否確認をFirestoreに保存
        await addDoc(
            collection(db, "safetyConfirmations"),
            {
                userId: user.uid,
                name: name,
                message: "無事です",
                createdAt: serverTimestamp()
            }
        );

        alert(name + "さんの安否確認を送信しました。");

    } catch (error) {

        console.error(error);

        alert(
            "安否確認の送信に失敗しました。\n\n" +
            error.code
        );
    }
}


// HTMLから呼び出せるようにする
window.sendSafetyMail = sendSafetyMail;
