
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    writeBatch,
    doc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    getAuth,
    onAuthStateChanged,
    EmailAuthProvider,
    reauthenticateWithCredential,
    deleteUser
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


// Firebase設定

const firebaseConfig = {
    apiKey: "AIzaSyA6stEZ00HAtMNEvUzG47zIUArCFJgsfTA",
    authDomain: "tetote-f459b.firebaseapp.com",
    projectId: "tetote-f459b",
    storageBucket: "tetote-f459b.firebasestorage.app",
    messagingSenderId: "4402684573",
    appId: "1:4402684573:web:09529c707357ce437dea74",
    measurementId: "G-CSGLSRBLDR"
};


// Firebase開始

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// 現在ログインしているユーザー

let currentUser = null;


// HTMLの要素

const taikaiBtn = document.getElementById("taikaiBtn");

const confirmModal = document.getElementById("confirmModal");

const cancelBtn = document.getElementById("cancelBtn");

const confirmBtn = document.getElementById("confirmBtn");

const passwordModal = document.getElementById("passwordModal");

const passwordCancelBtn =
    document.getElementById("passwordCancelBtn");

const deleteAccountBtn =
    document.getElementById("deleteAccountBtn");

const password =
    document.getElementById("password");


// ログイン状態を確認

onAuthStateChanged(auth, (user) => {

    if (user) {

        currentUser = user;

        console.log("ログイン中:", user.email);

    } else {

        alert("ログインしてください。");

        window.location.href = "../yamamoto/login.html";

    }

});


// 「退会する」を押したとき

taikaiBtn.addEventListener("click", () => {

    confirmModal.style.display = "flex";

});


// 「いいえ」を押したとき

cancelBtn.addEventListener("click", () => {

    confirmModal.style.display = "none";

});


// 「はい」を押したとき

confirmBtn.addEventListener("click", () => {

    confirmModal.style.display = "none";

    password.value = "";

    passwordModal.style.display = "flex";

});


// パスワード入力画面の「キャンセル」

passwordCancelBtn.addEventListener("click", () => {

    passwordModal.style.display = "none";

    password.value = "";

});


// 本当に退会する

deleteAccountBtn.addEventListener("click", async () => {

    if (!currentUser) {

        alert("ログイン情報を確認できません。");

        return;

    }


    const enteredPassword = password.value.trim();


    if (enteredPassword === "") {

        alert("パスワードを入力してください。");

        return;

    }


    // ボタンを押せないようにする

    deleteAccountBtn.disabled = true;

    deleteAccountBtn.textContent = "退会処理中...";


    try {

        // -------------------------
        // ① パスワードを再確認
        // -------------------------

        const credential =
            EmailAuthProvider.credential(
                currentUser.email,
                enteredPassword
            );


        await reauthenticateWithCredential(
            currentUser,
            credential
        );


        // -------------------------
        // ② 登録した連絡先を取得
        // -------------------------

        const contactsQuery = query(
            collection(db, "contacts"),
            where("userId", "==", currentUser.uid)
        );


        const snapshot =
            await getDocs(contactsQuery);


        // -------------------------
        // ③ 登録した連絡先を削除
        // -------------------------

        if (!snapshot.empty) {

            const batch = writeBatch(db);


            snapshot.forEach((contactDoc) => {

                batch.delete(
                    doc(
                        db,
                        "contacts",
                        contactDoc.id
                    )
                );

            });


            await batch.commit();

        }


        // -------------------------
        // ④ Firebaseアカウントを削除
        // -------------------------

        await deleteUser(currentUser);


        // -------------------------
        // ⑤ 完了
        // -------------------------

        alert("退会が完了しました。");

        window.location.href =
            "../yamamoto/login.html";


    } catch (error) {

        console.error("退会エラー:", error);


        if (
            error.code === "auth/invalid-credential" ||
            error.code === "auth/wrong-password"
        ) {

            alert("パスワードが間違っています。");

        } else if (
            error.code === "auth/requires-recent-login"
        ) {

            alert(
                "安全のため、もう一度ログインしてから退会してください。"
            );

        } else {

            alert(
                "退会処理に失敗しました。\nもう一度試してください。"
            );

        }


        deleteAccountBtn.disabled = false;

        deleteAccountBtn.textContent = "退会する";

    }

});
