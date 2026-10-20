```javascript
console.log("mypage.js 読み込み成功18");

// =====================================
// Firebase
// =====================================

import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged,
    EmailAuthProvider,
    reauthenticateWithCredential,
    verifyBeforeUpdateEmail
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    updateDoc
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
// Firebase開始
// =====================================

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// =====================================
// HTML要素
// =====================================

const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");

const editBtn = document.getElementById("editBtn");
const editModal = document.getElementById("editModal");
const editName = document.getElementById("editName");
const editEmail = document.getElementById("editEmail");

const currentPassword = document.getElementById("currentPassword");
const passwordArea = document.getElementById("passwordArea");

// パスワードの目の画像
const toggleCurrentPassword =
    document.getElementById("toggleCurrentPassword");

const currentPasswordEye =
    document.getElementById("currentPasswordEye");

const editCancel = document.getElementById("editCancel");
const editNext = document.getElementById("editNext");

const confirmModal = document.getElementById("confirmModal");
const confirmName = document.getElementById("confirmName");
const confirmEmail = document.getElementById("confirmEmail");
const confirmCancel = document.getElementById("confirmCancel");
const confirmSave = document.getElementById("confirmSave");

const completeModal = document.getElementById("completeModal");
const completeOk = document.getElementById("completeOk");

const errorModal = document.getElementById("errorModal");
const errorMessage = document.getElementById("errorMessage");
const errorOk = document.getElementById("errorOk");


// =====================================
// 現在のユーザー
// =====================================

let currentUser = null;


// =====================================
// 現在の登録情報
// =====================================

let originalName = "";
let originalEmail = "";


// =====================================
// 変更予定の情報
// =====================================

let newName = "";
let newEmail = "";


// =====================================
// モーダルを開く
// =====================================

function openModal(modal) {
    modal.hidden = false;
}


// =====================================
// モーダルを閉じる
// =====================================

function closeModal(modal) {
    modal.hidden = true;
}


// =====================================
// エラー表示
// =====================================

function showError(message) {
    errorMessage.textContent = message;
    openModal(errorModal);
}


// =====================================
// パスワードを隠す状態に戻す
// =====================================

function resetPasswordVisibility() {
    if (!currentPassword) return;

    currentPassword.type = "password";

    if (currentPasswordEye) {
        currentPasswordEye.src = "../hana/img/eye2.png";
    }

    if (toggleCurrentPassword) {
        toggleCurrentPassword.setAttribute(
            "aria-label",
            "パスワードを表示"
        );
    }
}


// =====================================
// 目の画像をクリックして表示・非表示
// =====================================

if (toggleCurrentPassword && currentPassword && currentPasswordEye) {
    toggleCurrentPassword.addEventListener("click", () => {
        const isHidden = currentPassword.type === "password";

        // パスワードの表示・非表示を切り替える
        currentPassword.type = isHidden ? "text" : "password";

        // 目の画像を切り替える
        currentPasswordEye.src = isHidden
            ? "../hana/img/eye1.png"
            : "../hana/img/eye2.png";

        // 読み上げ用の説明を変更する
        toggleCurrentPassword.setAttribute(
            "aria-label",
            isHidden ? "パスワードを隠す" : "パスワードを表示"
        );
    });
}


// =====================================
// ユーザー情報を読み込む
// =====================================

async function loadUserData(user) {
    try {
        console.log("① Firestore読み込み開始");

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        console.log("② Firestore読み込み完了");
        console.log("③ データが存在するか:", userSnap.exists());

        let name = "";

        if (userSnap.exists()) {
            const data = userSnap.data();
            name = data.name || "";
            console.log("④ 取得したデータ:", data);
        }

        if (!name) {
            name = user.displayName || "利用者";
        }

        const email = user.email || "";

        originalName = name;
        originalEmail = email;

        userName.textContent = name;
        userEmail.textContent = email;

        console.log("⑤ 画面への表示完了");

    } catch (error) {
        console.error("Firestore読み込みエラー:", error);
        showError("登録情報を読み込めませんでした。");
    }
}


// =====================================
// ログイン状態確認
// =====================================

onAuthStateChanged(auth, async (user) => {
    console.log("ログイン状態:", user);

    if (!user) {
        console.log("ログインしていません");

        userName.textContent = "ログインが必要です";
        userEmail.textContent = "";

        currentUser = null;
        return;
    }

    console.log("UID:", user.uid);

    currentUser = user;

    await loadUserData(user);
});


// =====================================
// 登録情報を変更する
// =====================================

editBtn.addEventListener("click", () => {
    editName.value = originalName;
    editEmail.value = originalEmail;

    currentPassword.value = "";

    // モーダルを開くたびにパスワードを隠す
    resetPasswordVisibility();

    // 最初はパスワード欄を非表示
    passwordArea.hidden = true;

    openModal(editModal);
});


// =====================================
// メールアドレスが変更されたか確認
// =====================================

editEmail.addEventListener("input", () => {
    const emailChanged =
        editEmail.value.trim() !== originalEmail;

    if (emailChanged) {
        passwordArea.hidden = false;
    } else {
        passwordArea.hidden = true;
        currentPassword.value = "";
        resetPasswordVisibility();
    }
});


// =====================================
// 編集画面「キャンセル」
// =====================================

editCancel.addEventListener("click", () => {
    closeModal(editModal);
    currentPassword.value = "";
    resetPasswordVisibility();
});


// =====================================
// 編集画面「次へ」
// =====================================

editNext.addEventListener("click", () => {
    const name = editName.value.trim();
    const email = editEmail.value.trim();

    // 名前チェック
    if (!name) {
        showError("名前を入力してください。");
        return;
    }

    // メールアドレスチェック
    if (!email) {
        showError("メールアドレスを入力してください。");
        return;
    }

    // メールアドレスの形式チェック
    if (!email.includes("@")) {
        showError("正しいメールアドレスを入力してください。");
        return;
    }

    // メールアドレス変更時のパスワードチェック
    if (
        email !== originalEmail &&
        !currentPassword.value
    ) {
        showError(
            "メールアドレスを変更する場合は、現在のパスワードを入力してください。"
        );
        return;
    }

    // 変更予定を保存
    newName = name;
    newEmail = email;

    // 確認画面に表示
    confirmName.textContent = newName;
    confirmEmail.textContent = newEmail;

    closeModal(editModal);
    openModal(confirmModal);
});


// =====================================
// 確認画面「戻る」
// =====================================

confirmCancel.addEventListener("click", () => {
    closeModal(confirmModal);
    openModal(editModal);
});


// =====================================
// 登録情報を変更
// =====================================

confirmSave.addEventListener("click", async () => {
    if (!currentUser) {
        showError("ログイン情報を確認できませんでした。");
        return;
    }

    // ボタンを一時的に無効化
    confirmSave.disabled = true;
    confirmSave.textContent = "変更中...";

    try {
        // Firestoreのユーザー情報
        const userRef = doc(db, "users", currentUser.uid);

        // 名前を変更
        await updateDoc(userRef, {
            name: newName
        });

        // メールアドレスを変更する場合
        if (newEmail !== originalEmail) {

            // 現在のパスワードで本人確認
            const credential = EmailAuthProvider.credential(
                originalEmail,
                currentPassword.value
            );

            await reauthenticateWithCredential(
                currentUser,
                credential
            );

            // 新しいメールアドレスへ確認メールを送信
            console.log("① メール送信処理を開始");
            console.log("変更先メールアドレス:", newEmail);

            await verifyBeforeUpdateEmail(
                currentUser,
                newEmail,
                {
                    url: "https://isha24156-max.github.io/tetote/yamamoto/login.html",
                    handleCodeInApp: false
                }
            );

            console.log("② メール送信処理が完了");

            // 名前を画面に反映
            originalName = newName;
            userName.textContent = originalName;

            // メールアドレスは確認完了後に変更される
            closeModal(confirmModal);

            showError(
                "確認メールを送信しました。\n\n" +
                "新しいメールアドレスに届いたメールを確認し、" +
                "メール内のリンクを押してください。"
            );

        } else {
            // 名前だけ変更した場合
            originalName = newName;
            userName.textContent = originalName;

            closeModal(confirmModal);
            openModal(completeModal);
        }

    } catch (error) {
        console.error(error);

        let message = "登録情報を変更できませんでした。";

        if (
            error.code === "auth/wrong-password" ||
            error.code === "auth/invalid-credential" ||
            error.code === "auth/invalid-login-credentials"
        ) {
            message = "現在のパスワードが違います。";

        } else if (
            error.code === "auth/email-already-in-use"
        ) {
            message = "そのメールアドレスはすでに使用されています。";

        } else if (
            error.code === "auth/invalid-email"
        ) {
            message = "正しいメールアドレスを入力してください。";

        } else if (
            error.code === "auth/requires-recent-login"
        ) {
            message =
                "本人確認の有効期限が切れています。" +
                "いったんログアウトして、もう一度ログインしてから変更してください。";
        }

        closeModal(confirmModal);
        showError(message);

    } finally {
        confirmSave.disabled = false;
        confirmSave.textContent = "変更する";
    }
});


// =====================================
// 完了「OK」
// =====================================

completeOk.addEventListener("click", () => {
    closeModal(completeModal);
});


// =====================================
// エラー「OK」
// =====================================

errorOk.addEventListener("click", () => {
    closeModal(errorModal);
});
```
