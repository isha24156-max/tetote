
console.log("taikai.js 読み込み成功");

// ========================================
// Firebaseの読み込み
// ========================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

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


// ========================================
// Firebase設定
// ========================================

const firebaseConfig = {
    apiKey: "AIzaSyA6stEZ00HAtMNEvUzG47zIUArCFJgsfTA",
    authDomain: "tetote-f459b.firebaseapp.com",
    projectId: "tetote-f459b",
    storageBucket: "tetote-f459b.firebasestorage.app",
    messagingSenderId: "4402684573",
    appId: "1:4402684573:web:09529c707357ce437dea74",
    measurementId: "G-CSGLSRBLDR"
};


// ========================================
// Firebaseの初期化
// ========================================

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);


// ========================================
// ログイン中のユーザー
// ========================================

let currentUser = null;

// 退会処理中かどうか
let isDeleting = false;


// ========================================
// HTMLの要素を取得
// ========================================

const taikaiBtn =
    document.getElementById("taikaiBtn");

const confirmModal =
    document.getElementById("confirmModal");

const cancelBtn =
    document.getElementById("cancelBtn");

const confirmBtn =
    document.getElementById("confirmBtn");

const passwordModal =
    document.getElementById("passwordModal");

const passwordCancelBtn =
    document.getElementById("passwordCancelBtn");

const deleteAccountBtn =
    document.getElementById("deleteAccountBtn");

const password =
    document.getElementById("password");

// パスワードエラー表示用
const passwordError =
    document.getElementById("passwordError");

// 退会完了画面
const completeModal =
    document.getElementById("completeModal");

const loginPageBtn =
    document.getElementById("loginPageBtn");


// ========================================
// エラーメッセージを表示
// ========================================

function showPasswordError(message) {

    if (!passwordError) {
        console.error(
            "passwordErrorがHTMLにありません。"
        );
        return;
    }

    passwordError.textContent = message;
    passwordError.style.display = "block";

}


// ========================================
// エラーメッセージを消す
// ========================================

function clearPasswordError() {

    if (!passwordError) {
        return;
    }

    passwordError.textContent = "";
    passwordError.style.display = "none";

}


// ========================================
// HTMLの要素があるか確認
// ========================================

console.log("taikaiBtn:", taikaiBtn);
console.log("confirmModal:", confirmModal);
console.log("confirmBtn:", confirmBtn);
console.log("passwordModal:", passwordModal);
console.log("passwordError:", passwordError);
console.log("completeModal:", completeModal);


// ========================================
// ログイン状態を確認
// ========================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        currentUser = user;

        console.log(
            "ログイン中:",
            user.email
        );

    } else {

        // 退会処理中なら
        // ログイン画面への移動を行わない

        if (isDeleting) {

            console.log(
                "退会処理によってログアウトされました"
            );

            return;
        }

        // ログインしていない場合

        alert("ログインしてください。");

        window.location.href =
            "../yamamoto/login.html";

    }

});


// ========================================
// 「退会する」を押す
// ========================================

taikaiBtn.addEventListener("click", () => {

    console.log(
        "退会するボタンが押されました"
    );

    confirmModal.style.display = "flex";

});


// ========================================
// 確認画面の「いいえ」を押す
// ========================================

cancelBtn.addEventListener("click", () => {

    console.log(
        "退会をキャンセルしました"
    );

    confirmModal.style.display = "none";

});


// ========================================
// 確認画面の「はい」を押す
// ========================================

confirmBtn.addEventListener("click", () => {

    console.log(
        "「はい」が押されました"
    );

    confirmModal.style.display = "none";

    // パスワード入力欄を空にする
    password.value = "";

    // 前回のエラーを消す
    clearPasswordError();

    // パスワード入力画面を表示
    passwordModal.style.display = "flex";

});


// ========================================
// パスワード入力画面のキャンセル
// ========================================

passwordCancelBtn.addEventListener("click", () => {

    passwordModal.style.display = "none";

    password.value = "";

    clearPasswordError();

});


// ========================================
// ログイン画面へ移動
// ========================================

loginPageBtn.addEventListener("click", () => {

    window.location.href =
        "../yamamoto/login.html";

});


// ========================================
// パスワード入力中にエラーを消す
// ========================================

password.addEventListener("input", () => {

    clearPasswordError();

});


// ========================================
// 最終的に退会する
// ========================================

deleteAccountBtn.addEventListener(
    "click",
    async () => {

        console.log(
            "最終退会ボタンが押されました"
        );

        // ==================================
        // ログイン確認
        // ==================================

        if (!currentUser) {

            showPasswordError(
                "ログイン情報を確認できません。"
            );

            return;

        }

        // ==================================
        // パスワード取得
        // ==================================

        const enteredPassword =
            password.value.trim();

        if (enteredPassword === "") {

            showPasswordError(
                "パスワードを入力してください。"
            );

            return;

        }

        // ==================================
        // 退会処理中の表示
        // ==================================

        deleteAccountBtn.disabled = true;

        deleteAccountBtn.textContent =
            "退会処理中...";

        clearPasswordError();

        try {

            // ==================================
            // ① パスワードを再確認
            // ==================================

            console.log(
                "パスワードを確認しています..."
            );

            const credential =
                EmailAuthProvider.credential(
                    currentUser.email,
                    enteredPassword
                );

            await reauthenticateWithCredential(
                currentUser,
                credential
            );

            console.log(
                "パスワード確認成功"
            );


            // ==================================
            // ② 自分の連絡先を取得
            // ==================================

            const contactsQuery = query(
                collection(db, "contacts"),
                where(
                    "userId",
                    "==",
                    currentUser.uid
                )
            );

            const snapshot =
                await getDocs(contactsQuery);

            console.log(
                "連絡先の数:",
                snapshot.size
            );


            // ==================================
            // ③ 自分の連絡先を削除
            // ==================================

            if (!snapshot.empty) {

                const batch =
                    writeBatch(db);

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

                console.log(
                    "連絡先削除完了"
                );

            }


            // ==================================
            // ④ 退会処理中にする
            // ==================================

            isDeleting = true;


            // ==================================
            // ⑤ Firebaseアカウントを削除
            // ==================================

            await deleteUser(currentUser);

            console.log(
                "アカウント削除完了"
            );


            // ==================================
            // ⑥ 退会完了画面を表示
            // ==================================

            passwordModal.style.display = "none";

            completeModal.style.display = "flex";


        } catch (error) {

            console.error(
                "退会エラー:",
                error
            );

            // ==================================
            // エラー発生時の処理
            // ==================================

            isDeleting = false;

            if (
                error.code === "auth/invalid-credential" ||
                error.code === "auth/wrong-password" ||
                error.code === "auth/invalid-login-credentials"
            ) {

                // パスワードが間違っている場合
                showPasswordError(
                    "パスワードが間違っています。もう一度入力してください。"
                );

                password.value = "";
                password.focus();

            } else if (
                error.code === "auth/requires-recent-login"
            ) {

                showPasswordError(
                    "安全のため、もう一度ログインしてから退会してください。"
                );

            } else {

                showPasswordError(
                    "退会処理に失敗しました。もう一度試してください。"
                );

            }

        } finally {

            // ==================================
            // ボタンを元に戻す
            // ==================================

            deleteAccountBtn.disabled = false;

            deleteAccountBtn.textContent =
                "退会する";

        }

    }
);

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const passwordEye = document.getElementById("passwordEye");

togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";

    passwordInput.type = isHidden ? "text" : "password";

    passwordEye.src = isHidden
        ? "../hana/img/eye1.png"
        : "../hana/img/eye2.png";

    togglePassword.setAttribute(
        "aria-label",
        isHidden ? "パスワードを隠す" : "パスワードを表示"
    );
});
