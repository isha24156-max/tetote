
console.log("taikai.js 読み込み成功");


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
// Firebaseを開始
// ========================================

const app = initializeApp(firebaseConfig);

const db = getFirestore(app);

const auth = getAuth(app);


// ========================================
// 現在ログインしているユーザー
// ========================================

let currentUser = null;


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


// ========================================
// ログイン状態を確認
// ========================================

onAuthStateChanged(auth, (user) => {

    if (user) {

        currentUser = user;

        console.log(
            "ログイン中のユーザー:",
            user.email
        );

        console.log(
            "ユーザーUID:",
            user.uid
        );

    } else {

        alert("ログインしてください。");

        window.location.href =
            "../yamamoto/login.html";

    }

});


// ========================================
// 「退会する」ボタン
// ========================================

taikaiBtn.addEventListener("click", () => {

    console.log(
        "退会するボタンが押されました"
    );

    confirmModal.style.display = "flex";

});


// ========================================
// 「いいえ」ボタン
// ========================================

cancelBtn.addEventListener("click", () => {

    console.log(
        "退会をキャンセルしました"
    );

    confirmModal.style.display = "none";

});


// ========================================
// 「はい」ボタン
// ========================================

confirmBtn.addEventListener("click", () => {

    console.log(
        "退会確認で「はい」が押されました"
    );

    confirmModal.style.display = "none";

    password.value = "";

    passwordModal.style.display = "flex";

});


// ========================================
// パスワード入力画面の「キャンセル」
/ ========================================

passwordCancelBtn.addEventListener("click", () => {

    passwordModal.style.display = "none";

    password.value = "";

});


// ========================================
// 最終的に退会する
// ========================================

deleteAccountBtn.addEventListener(
    "click",
    async () => {

        console.log(
            "最終的な退会ボタンが押されました"
        );


        // --------------------------------
        // ログイン確認
        // --------------------------------

        if (!currentUser) {

            alert(
                "ログイン情報を確認できません。"
            );

            return;

        }


        // --------------------------------
        // パスワード取得
        // --------------------------------

        const enteredPassword =
            password.value.trim();


        if (enteredPassword === "") {

            alert(
                "パスワードを入力してください。"
            );

            return;

        }


        // --------------------------------
        // 二重クリック防止
        // --------------------------------

        deleteAccountBtn.disabled = true;

        deleteAccountBtn.textContent =
            "退会処理中...";


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

            console.log(
                "登録されている連絡先を確認しています..."
            );


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
                "登録されている連絡先:",
                snapshot.size
            );


            // ==================================
            // ③ 自分の連絡先を削除
            // ==================================

            if (!snapshot.empty) {

                console.log(
                    "連絡先を削除しています..."
                );


                const batch =
                    writeBatch(db);


                snapshot.forEach(
                    (contactDoc) => {

                        batch.delete(
                            doc(
                                db,
                                "contacts",
                                contactDoc.id
                            )
                        );

                    }
                );


                await batch.commit();


                console.log(
                    "連絡先の削除が完了しました"
                );

            } else {

                console.log(
                    "削除する連絡先はありません"
                );

            }


            // ==================================
            // ④ Firebaseアカウントを削除
            // ==================================

            console.log(
                "Firebaseアカウントを削除しています..."
            );


            await deleteUser(currentUser);


            console.log(
                "Firebaseアカウントの削除が完了しました"
            );


            // ==================================
            // ⑤ 完了
            // ==================================

            alert(
                "退会が完了しました。"
            );


            window.location.href =
                "../yamamoto/login.html";


        } catch (error) {

            console.error(
                "退会エラー:",
                error
            );


            // --------------------------------
            // パスワードが間違っている
            // --------------------------------

            if (
                error.code ===
                    "auth/invalid-credential" ||

                error.code ===
                    "auth/wrong-password"
            ) {

                alert(
                    "パスワードが間違っています。"
                );


            // --------------------------------
            // 再ログインが必要
            // --------------------------------

            } else if (
                error.code ===
                    "auth/requires-recent-login"
            ) {

                alert(
                    "安全のため、もう一度ログインしてから退会してください。"
                );


            // --------------------------------
            // その他のエラー
            // --------------------------------

            } else {

                alert(
                    "退会処理に失敗しました。\n" +
                    "もう一度試してください。"
                );

            }


            // ボタンを元に戻す

            deleteAccountBtn.disabled =
                false;

            deleteAccountBtn.textContent =
                "退会する";

        }

    }
);
