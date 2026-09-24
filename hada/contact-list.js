import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    deleteDoc,
    doc,
    query,
    where
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
// 削除する連絡先を保存
// =====================================

let deleteTargetId = null;


// =====================================
// 連絡先一覧を表示
// =====================================

async function showList(user) {

    const list = document.getElementById("mailList");


    if (!list) {

        console.error("mailListが見つかりません");

        return;
    }


    // 一度一覧を空にする
    list.innerHTML = "";


    try {

        // =================================
        // ★ログインしている人のUIDだけ検索
        // =================================

        const contactsQuery = query(

            collection(db, "contacts"),

            where("userId", "==", user.uid)

        );


        const snapshot = await getDocs(contactsQuery);


        // =================================
        // 連絡先がない場合
        // =================================

        if (snapshot.empty) {

            const emptyMessage = document.createElement("li");

            emptyMessage.textContent =
                "登録されている連絡先はありません。";

            list.appendChild(emptyMessage);

            return;
        }


        // =================================
        // 連絡先を1件ずつ表示
        // =================================

        snapshot.forEach((docSnapshot) => {

            const contact = docSnapshot.data();


            // liを作成
            const li = document.createElement("li");


            // =================================
            // 名前と削除ボタン
            // =================================

            const nameArea =
                document.createElement("div");

            nameArea.classList.add("name-area");


            // 名前
            const name =
                document.createElement("strong");

            name.textContent = contact.name;


            // =================================
            // 削除ボタン
            // =================================

            const deleteButton =
                document.createElement("button");

            deleteButton.textContent = "×";

            deleteButton.classList.add("delete-button");


            // 削除ボタンを押したとき
            deleteButton.addEventListener("click", () => {

                // 削除するデータのIDを保存
                deleteTargetId = docSnapshot.id;


                // 削除確認メッセージ
                document.getElementById(
                    "deleteMessage"
                ).textContent =
                    `${contact.name}さんの連絡先を削除してもよろしいですか？`;


                // 削除確認画面を表示
                document.getElementById(
                    "deleteModal"
                ).style.display = "flex";

            });


            nameArea.appendChild(name);

            nameArea.appendChild(deleteButton);


            // =================================
            // メールアドレス
            // =================================

            const email =
                document.createElement("div");

            email.textContent =
                `📧 ${contact.email}`;


            // =================================
            // liに追加
            // =================================

            li.appendChild(nameArea);

            li.appendChild(email);

            list.appendChild(li);

        });


    } catch (error) {

        console.error(
            "連絡先の取得エラー:",
            error
        );

        alert("連絡先を取得できませんでした。");

    }

}


// =====================================
// キャンセルボタン
// =====================================

document.getElementById(
    "cancelDelete"
).addEventListener("click", () => {


    // 確認画面を閉じる
    document.getElementById(
        "deleteModal"
    ).style.display = "none";


    // 削除対象をリセット
    deleteTargetId = null;

});


// =====================================
// 削除するボタン
// =====================================

document.getElementById(
    "confirmDelete"
).addEventListener("click", async () => {


    // 削除対象がない場合
    if (!deleteTargetId) {

        return;
    }


    try {

        // =================================
        // Firestoreから削除
        // =================================

        await deleteDoc(

            doc(
                db,
                "contacts",
                deleteTargetId
            )

        );


        // =================================
        // 確認画面を閉じる
        // =================================

        document.getElementById(
            "deleteModal"
        ).style.display = "none";


        // 削除対象をリセット
        deleteTargetId = null;


        // =================================
        // 一覧を更新
        // =================================

        if (auth.currentUser) {

            showList(auth.currentUser);

        }


    } catch (error) {

        console.error(
            "削除エラー:",
            error
        );

        alert("削除できませんでした。");

    }

});


// =====================================
// ログイン状態を確認
// =====================================

onAuthStateChanged(auth, (user) => {


    if (user) {

        // =================================
        // ログインしている
        // =================================

        console.log(
            "ログイン中のUID:",
            user.uid
        );


        // 自分の連絡先だけ表示
        showList(user);


    } else {

        // =================================
        // ログインしていない
        // =================================

        alert("ログインしてください。");

        window.location.href = "login.html";

    }

});
