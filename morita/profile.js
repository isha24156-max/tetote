import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getFirestore,
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


// =====================================
// Firebase設定
// =====================================

const firebaseConfig = {
    apiKey: "AIzaSyA6stEZ00HAtMNEvUzG47zIUArCFJgsfTA",
    authDomain: "tetote-f459b.firebaseapp.com",
    projectId: "tetote-f459b",
    storageBucket: "tetote-f459b.firebasestorage.app",
    messagingSenderId: "4402684573",
    appId: "1:4402684573:web:09529c707357ce437dea74",
    measurementId: "G-CSGLSRBLDR"
};


// =====================================
// Firebaseを初期化
// =====================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// =====================================
// HTMLの要素
// =====================================

const registerBtn =
    document.getElementById("registerBtn");

const nameInput =
    document.getElementById("nameInput");

const emailInput =
    document.getElementById("emailInput");

const completeModal =
    document.getElementById("completeModal");

const homeBtn =
    document.getElementById("homeBtn");


// =====================================
// ログイン中のユーザー
// =====================================

let currentUser = null;

onAuthStateChanged(auth, (user) => {

    if (user) {

        currentUser = user;

        console.log(
            "ログイン中のUID:",
            user.uid
        );

    } else {

        currentUser = null;

        alert("ログインしてください。");

        window.location.href =
            "../yamamoto/login.html";

    }

});


// =====================================
// 登録ボタン
// =====================================

registerBtn.addEventListener("click", async (e) => {

    e.preventDefault();


    // ログイン確認
    if (!currentUser) {

        alert(
            "ログイン情報を確認しています。少し待ってからもう一度押してください。"
        );

        return;
    }


    // =================================
    // 入力内容を取得
    // =================================

    const name =
        nameInput.value.trim();

    const email =
        emailInput.value.trim();


    // =================================
    // 未入力チェック
    // =================================

    if (!name || !email) {

        alert(
            "名前とメールアドレスを入力してください。"
        );

        return;
    }


    try {

        // =================================
        // contactsに登録
        // =================================

        await addDoc(
            collection(db, "contacts"),
            {
                name: name,
                email: email,

                // ★ログインしている本人のUID
                userId: currentUser.uid,

                createdAt: Date.now()
            }
        );


        console.log("連絡先を登録しました");


        // =================================
        // 入力欄を消す
        // =================================

        nameInput.value = "";

        emailInput.value = "";


        // =================================
        // 登録完了を表示
        // =================================

        completeModal.classList.remove("hidden");


        // =================================
        // 2秒後に登録完了を消す
        // =================================

        setTimeout(() => {

            completeModal.classList.add("hidden");

        }, 2000);


    } catch (error) {

        console.error(
            "登録エラー:",
            error
        );

        alert(
            "登録に失敗しました。"
        );

    }

});


// =====================================
// ホームに戻る
// =====================================

homeBtn.addEventListener("click", () => {

    window.location.href =
        "../hada/home.html";

});
