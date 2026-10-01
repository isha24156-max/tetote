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
    updateEmail
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc,
    setDoc,
    updateDoc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


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


// Firebase開始
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// =====================================
// HTML要素
// =====================================

const userName =
    document.getElementById("userName");

const userEmail =
    document.getElementById("userEmail");

const editBtn =
    document.getElementById("editBtn");

const editModal =
    document.getElementById("editModal");

const editName =
    document.getElementById("editName");

const editEmail =
    document.getElementById("editEmail");

const currentPassword =
    document.getElementById("currentPassword");

const passwordArea =
    document.getElementById("passwordArea");

const editCancel =
    document.getElementById("editCancel");

const editNext =
    document.getElementById("editNext");

const confirmModal =
    document.getElementById("confirmModal");

const confirmName =
    document.getElementById("confirmName");

const confirmEmail =
    document.getElementById("confirmEmail");

const confirmCancel =
    document.getElementById("confirmCancel");

const confirmSave =
    document.getElementById("confirmSave");

const completeModal =
    document.getElementById("completeModal");

const completeOk =
    document.getElementById("completeOk");

const errorModal =
    document.getElementById("errorModal");

const errorMessage =
    document.getElementById("errorMessage");

const errorOk =
    document.getElementById("errorOk");


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
// ユーザー情報を読み込む
// =====================================

async function loadUserData(user) {

    try {

        // Firestoreのusers/{UID}を取得
        const userRef =
            doc(db, "users", user.uid);

        const userSnap =
            await getDoc(userRef);


        let name = "";


        if (userSnap.exists()) {

            const data =
                userSnap.data();

            name =
                data.name || "";

        }


        // 名前がFirestoreにない場合
        // Firebase AuthenticationのdisplayNameを使用
        if (!name) {

            name =
                user.displayName || "利用者";

        }


        // メールアドレス
        const email =
            user.email || "";


        originalName = name;

        originalEmail = email;


        // 画面に表示
        userName.textContent = name;

        userEmail.textContent = email;

    } catch (error) {

        console.error(error);

        showError(
            "登録情報を読み込めませんでした。"
        );

    }

}


// =====================================
// ログイン状態確認
// =====================================

onAuthStateChanged(
    auth,
    async (user) => {

        if (!user) {

            // ログインしていない場合
            location.href = "login.html";

            return;
        }


        currentUser = user;


        await loadUserData(user);

    }
);


// =====================================
// 「登録情報を変更する」
// =====================================

editBtn.addEventListener(
    "click",
    () => {

        // 現在の情報を入力欄に入れる
        editName.value =
            originalName;

        editEmail.value =
            originalEmail;

        currentPassword.value = "";


        // 最初はパスワード欄を非表示
        passwordArea.hidden = true;


        openModal(editModal);

    }
);


// =====================================
// メールアドレスが変更されたか確認
// =====================================

editEmail.addEventListener(
    "input",
    () => {

        const emailChanged =
            editEmail.value.trim() !==
            originalEmail;


        if (emailChanged) {

            passwordArea.hidden = false;

        } else {

            passwordArea.hidden = true;

            currentPassword.value = "";

        }

    }
);


// =====================================
// 編集画面「キャンセル」
// =====================================

editCancel.addEventListener(
    "click",
    () => {

        closeModal(editModal);

    }
);


// =====================================
// 編集画面「次へ」
// =====================================

editNext.addEventListener(
    "click",
    () => {

        const name =
            editName.value.trim();

        const email =
            editEmail.value.trim();


        // 名前チェック
        if (!name) {

            showError(
                "名前を入力してください。"
            );

            return;

        }


        // メールチェック
        if (!email) {

            showError(
                "メールアドレスを入力してください。"
            );

            return;

        }


        // メールアドレスの簡単な形式チェック
        if (!email.includes("@")) {

            showError(
                "正しいメールアドレスを入力してください。"
            );

            return;

        }


        // メールアドレスが変更される場合
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
        confirmName.textContent =
            newName;

        confirmEmail.textContent =
            newEmail;


        closeModal(editModal);

        openModal(confirmModal);

    }
);


// =====================================
// 確認画面「戻る」
// =====================================

confirmCancel.addEventListener(
    "click",
    () => {

        closeModal(confirmModal);

        openModal(editModal);

    }
);


// =====================================
// 登録情報を変更
// =====================================

confirmSave.addEventListener(
    "click",
    async () => {

        if (!currentUser) {

            showError(
                "ログイン情報を確認できませんでした。"
            );

            return;

        }


        // ボタンを一時的に無効化
        confirmSave.disabled = true;

        confirmSave.textContent =
            "変更中...";


        try {

            // ---------------------------------
            // 名前を変更
            // ---------------------------------

            const userRef =
                doc(
                    db,
                    "users",
                    currentUser.uid
                );


            await updateDoc(
                userRef,
                {
                    name: newName
                }
            );


            // ---------------------------------
            // メールアドレスを変更
            // ---------------------------------

            if (newEmail !== originalEmail) {

                const credential =
                    EmailAuthProvider.credential(
                        originalEmail,
                        currentPassword.value
                    );


                // 本人確認
                await reauthenticateWithCredential(
                    currentUser,
                    credential
                );


                // Firebase Authenticationのメールを変更
                await updateEmail(
                    currentUser,
                    newEmail
                );


                // Firestore側のメールも変更
                await setDoc(
                    userRef,
                 {
                        name: newName
                    },
                 {
        merge: true
    }
);

            }


            // ---------------------------------
            // 表示を更新
            // ---------------------------------

            originalName = newName;

            originalEmail = newEmail;

            userName.textContent =
                originalName;

            userEmail.textContent =
                originalEmail;


            closeModal(confirmModal);

            openModal(completeModal);


        } catch (error) {

            console.error(error);


            let message =
                "登録情報を変更できませんでした。";


            if (
                error.code ===
                "auth/wrong-password"
            ) {

                message =
                    "現在のパスワードが違います。";

            } else if (
                error.code ===
                "auth/invalid-credential"
            ) {

                message =
                    "現在のパスワードが違います。";

            } else if (
                error.code ===
                "auth/email-already-in-use"
            ) {

                message =
                    "そのメールアドレスはすでに使用されています。";

            } else if (
                error.code ===
                "auth/invalid-email"
            ) {

                message =
                    "正しいメールアドレスを入力してください。";

            } else if (
                error.code ===
                "auth/requires-recent-login"
            ) {

                message =
                    "本人確認の有効期限が切れています。いったんログアウトして、もう一度ログインしてから変更してください。";

            }


            closeModal(confirmModal);

            showError(message);

        } finally {

            confirmSave.disabled = false;

            confirmSave.textContent =
                "変更する";

        }

    }
);


// =====================================
// 完了「OK」
// =====================================

completeOk.addEventListener(
    "click",
    () => {

        closeModal(completeModal);

    }
);


// =====================================
// エラー「OK」
// =====================================

errorOk.addEventListener(
    "click",
    () => {

        closeModal(errorModal);

    }
);
