console.log('成功２');
// =====================================
// Firebase
// =====================================

import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getAuth,
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";


// =====================================
// Firebase設定
// =====================================

const firebaseConfig = {

    apiKey:
        "AIzaSyA6stEZ00HAtMNEvUzG47zIUArCFJgsfTA",

    authDomain:
        "tetote-f459b.firebaseapp.com",

    projectId:
        "tetote-f459b",

    storageBucket:
        "tetote-f459b.firebasestorage.app",

    messagingSenderId:
        "4402684573",

    appId:
        "1:4402684573:web:09529c707357ce437dea74",

    measurementId:
        "G-CSGLSRBLDR"

};


// =====================================
// Firebaseを初期化
// =====================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);


// =====================================
// メッセージ表示
// =====================================

function showMessage(message, callback) {

    const modal = document.getElementById("messageModal");
    const messageText = document.getElementById("messageText");
    const messageOk = document.getElementById("messageOk");

    messageText.textContent = message;
    modal.hidden = false;

    messageOk.onclick = () => {

        modal.hidden = true;

        if (callback) {
            callback();
        }

    };

}


// =====================================
// ログイン
// =====================================

document
    .getElementById("loginBtn")
    .addEventListener("click", async () => {

        const email =
            document
                .getElementById("email")
                .value
                .trim();

        const password =
            document
                .getElementById("password")
                .value;


        // =================================
        // 未入力チェック
        // =================================

        if (!email || !password) {

            showMessage(
                "メールアドレスとパスワードを入力してください。"
            );

            return;

        }


        try {

            // =================================
            // Firebaseでログイン
            // =================================

            await signInWithEmailAndPassword(
                auth,
                email,
                password
            );


            // =================================
            // ログイン成功
            // =================================

            const user = auth.currentUser;

            // 管理用アカウントのUIDを指定
            const ADMIN_UID = "fi2StRZ3mAfkG1clLE5RhSWZpcr2";
            
            if (user && user.uid === ADMIN_UID) {
                showMessage(
                    "管理者としてログインしました！",
                    () => {
                        location.href = "../admin.html";
                    }
                );
            } else {
                showMessage(
                    "ログインしました！",
                    () => {
                        location.href = "../hana/mail.html";
                    }
                );
            }


            // =================================
            // ログイン失敗
            // =================================

                    } catch (error) {

                        console.error("ログインエラー:", error);
            
                        // ログイン失敗
                        if (
                            error.code === "auth/invalid-credential" ||
                            error.code === "auth/wrong-password" ||
                            error.code === "auth/user-not-found"
                        ) {
                            showMessage(
                                "メールアドレスまたはパスワードが違います。"
                            );
                        } else {
                            showMessage(
                                "ログインに失敗しました。"
                            );
                        }
            
                    }
            
                });


 // =====================================
 // パスワード表示・非表示
 // =====================================

const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("togglePassword");
const passwordEye = document.getElementById("passwordEye");

togglePassword.addEventListener("click", () => {
    const isHidden = passwordInput.type === "password";

    // パスワードを表示・非表示に切り替える
    passwordInput.type = isHidden ? "text" : "password";

    // 目の画像を切り替える
    passwordEye.src = isHidden
        ? "../hana/img/eye1.png"
        : "../hana/img/eye2.png";

    // 読み上げ用の説明も切り替える
    togglePassword.setAttribute(
        "aria-label",
        isHidden ? "パスワードを隠す" : "パスワードを表示"
    );
});


