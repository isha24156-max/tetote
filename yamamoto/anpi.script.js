console.log("anpi.js 読み込み成功8");
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
    query,
    where,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

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
    publicKey: "Fwl75YiiPq5P3uBPe"
});

const EMAIL_SERVICE_ID = "tetote-mail";
const EMAIL_TEMPLATE_ID = "template_ci5ot6i";

 // メッセージ表示用
const messageModal = document.getElementById("message-modal");
const messageText = document.getElementById("message-text");
const messageOk = document.getElementById("message-ok");
const messageCancel = document.getElementById("message-cancel");

function closeMessageModal() {
    messageModal.classList.add("hidden");
}

// 通常のメッセージ表示
function showMessage(message) {
    messageText.textContent = message;
    messageCancel.style.display = "none";
    messageOk.onclick = closeMessageModal;
    messageModal.classList.remove("hidden");
}

// 送信前の確認表示
function showConfirm(message) {
    messageText.textContent = message;
    messageCancel.style.display = "inline-block";
    messageModal.classList.remove("hidden");

    return new Promise((resolve) => {
        messageOk.onclick = () => {
            closeMessageModal();
            resolve(true);
        };

        messageCancel.onclick = () => {
            closeMessageModal();
            resolve(false);
        };
    });
}


// ==============================
// メール送信
// ==============================

async function sendSafetyMail(message) {

   
   const confirmSend = await showConfirm(
    `登録している連絡先に「${message}」と送信しますか？`
);

if (!confirmSend) {
    return;
}

    // ログインしているユーザーを取得
    const user = auth.currentUser;

    
    if (!user) {
    showMessage("ログインしてください。");
    return;
    }

    console.log("今ログインしているUID:", user.uid);

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
            query(
                collection(db, "contacts"),
                where("userId", "==", user.uid)
            )
        );

        console.log("検索に使っているUID:", user.uid);
        console.log("取得した連絡先の件数:", contactsSnapshot.size);
        console.log("取得した連絡先:", contactsSnapshot.docs.map(doc => doc.data()));

        if (contactsSnapshot.empty) {
           showMessage("登録されている連絡先がありません。");
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

            console.log("送信しようとしているメールアドレス:", email);
            console.log("Service ID:", EMAIL_SERVICE_ID);
            console.log("Template ID:", EMAIL_TEMPLATE_ID);

            console.log("EmailJSに渡すデータ:", {
                serviceId: EMAIL_SERVICE_ID,
                templateId: EMAIL_TEMPLATE_ID,
                to_email: email,
                message: message
            });
            
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

       showMessage(
        「${message}」を${sendCount}人に送信しました。`);


    } catch (error) {

        console.error(error);

       showMessage(
            "メール送信に失敗しました。\n\n" +
            error.message
        );
    }
}


// 無事ですを送信

async function sendSafeMail() {
    await sendSafetyMail("無事です");
}

// 危険ですを送信

async function sendDangerMail() {
    await sendSafetyMail("危険です");
}

// HTMLから呼び出せるようにする
window.sendSafeMail = sendSafeMail;
window.sendDangerMail = sendDangerMail;

// ボタンに処理を設定
document.getElementById("safeBtn").addEventListener("click", sendSafeMail);
document.getElementById("dangerBtn").addEventListener("click", sendDangerMail);
