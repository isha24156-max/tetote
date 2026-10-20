// =====================================
// Firebase
// =====================================

import { initializeApp }
  from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
  getAuth,
  createUserWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


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

const auth = getAuth(app);
const db = getFirestore(app);


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
        ? // "../hana/img/eye1.png"
        : "../hana/img/eye2.png";

    // 読み上げ用の説明も切り替える
    togglePassword.setAttribute(
        "aria-label",
        isHidden ? "パスワードを隠す" : "パスワードを表示"
    );
});


// =====================================
// 新規登録
// =====================================

document
  .getElementById("registerBtn")
  .addEventListener("click", async () => {

    const name =
      document.getElementById("name").value.trim();

    const email =
      document.getElementById("email").value.trim();

    const password =
      document.getElementById("password").value;


    // =================================
    // 未入力チェック
    // =================================

    if (!name || !email || !password) {

      showMessage(
        "すべて入力してください。"
      );

      return;
    }


    // =================================
    // パスワードチェック
    // =================================

    if (password.length < 6) {

      showMessage(
        "パスワードは6文字以上にしてください。"
      );

      return;
    }


    try {

      // =================================
      // Firebase Authenticationに登録
      // =================================

      const userCredential =
        await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );


      // =================================
      // UIDを取得
      // =================================

      const uid =
        userCredential.user.uid;


      // =================================
      // Firestoreに保存
      // =================================

      await setDoc(
        doc(db, "users", uid),
        {
          name: name,
          email: email,
          createdAt: Date.now()
        }
      );


      // =================================
      // 登録成功
      // =================================

      showMessage(
        "登録しました！",
        () => {

          // 連絡先登録画面へ
          location.href = "../hana/mail.html";

        }
      );


    } catch (error) {

      console.error(
        "登録エラー:",
        error
      );


      // =================================
      // 登録失敗
      // =================================

      showMessage(
        "登録に失敗しました。\n\nエラー：" +
        error.code
      );

    }

  });
