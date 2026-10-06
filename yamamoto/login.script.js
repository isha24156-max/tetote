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
// パスワード表示・非表示
// =====================================

const passwordInput =
    document.getElementById("password");

const togglePassword =
    document.getElementById("togglePassword");


togglePassword.addEventListener("click", () => {

    if (passwordInput.type === "password") {

        passwordInput.type = "text";

        togglePassword.classList.add("show");

        togglePassword.setAttribute(
            "aria-label",
            "パスワードを非表示"
        );

    } else {

        passwordInput.type = "password";

        togglePassword.classList.remove("show");

        togglePassword.setAttribute(
            "aria-label",
            "パスワードを表示"
        );

    }

});


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

            showMessage(
                "ログインしました！",
                () => {

                    location.href = "../hana/mail.html";

                }
            );


        } catch (error) {

            console.error("ログインエラー:", error);


            // =================================
            // ログイン失敗
            // =================================

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
