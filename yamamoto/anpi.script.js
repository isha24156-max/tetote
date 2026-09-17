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
    getDocs,
    serverTimestamp
} 

alert("JavaScriptは動いています");

from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


// ==============================
// Firebase
// ==============================

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


// ==============================
// EmailJS
// ==============================

emailjs.init({
    publicKey: "FwI75YiPiq5P3uBPe"
});

const EMAIL_SERVICE_ID = "tetote-mail";
const EMAIL_TEMPLATE_ID = "template_ci5ot6i";


// ==============================
// メール送信
// ==============================

async function sendSafetyMail(message) {

    const confirmSend = confirm(
        `登録している連絡先に「${message}」と送信しますか？`
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

        // ==============================
        // 利用者の名前を取得
        // ==============================

        const userDoc = await getDoc(
            doc(db, "users", user.uid)
        );

        const userData = userDoc.data();

        const name = userData?.name || "利用者";


        // ==============================
        // contactsから登録者を取得
        // ==============================

        const contactsSnapshot = await getDocs(
            collection(db, "contacts")
        );

        if (contactsSnapshot.empty) {
            alert("登録されている連絡先がありません。");
            return;
        }


        // ==============================
        // 全員にメール送信
        // ==============================

        let sendCount = 0;

        for (const contactDoc of contactsSnapshot.docs) {

            const contact = contactDoc.data();

            const email = contact.email;

            if (!email) {
                continue;
            }

            await emailjs.send(
                EMAIL_SERVICE_ID,
                EMAIL_TEMPLATE_ID,
                {
                    to_email: email,
                    message: message
                }
            );

            sendCount++;

            // EmailJSの送信間隔制限に対応
            await new Promise(resolve => setTimeout(resolve, 1000));
        }


        // ==============================
        // 安否確認をFirestoreに保存
        // ==============================

        await addDoc(
            collection(db, "safetyConfirmations"),
            {
                userId: user.uid,
                name: name,
                message: message,
                createdAt: serverTimestamp()
            }
        );


        alert(
            `${name}さんの「${message}」を${sendCount}人に送信しました。`
        );


    } catch (error) {

        console.error(error);

        alert(
            "メール送信に失敗しました。\n\n" +
            error.message
        );
    }
}


// ==============================
// 無事です
// ==============================

async function sendSafeMail() {
    await sendSafetyMail("無事です");
}


// ==============================
// 危険です
// ==============================

async function sendDangerMail() {
    await sendSafetyMail("危険です");
}


// HTMLから呼び出せるようにする
window.sendSafeMail = sendSafeMail;
window.sendDangerMail = sendDangerMail;
