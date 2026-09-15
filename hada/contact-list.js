import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getFirestore,
    collection,
    getDocs,
    deleteDoc,
    doc
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


const firebaseConfig = {
    apiKey: "AIzaSyA6stEZ00HAtMNEvUzG47zIUArCFJgsfTA",
    authDomain: "tetote-f459b.firebaseapp.com",
    projectId: "tetote-f459b",
    storageBucket: "tetote-f459b.firebasestorage.app",
    messagingSenderId: "4402684573",
    appId: "1:4402684573:web:09529c707357ce437dea74",
    measurementId: "G-CSGLSRBLDR"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


// 削除する連絡先を一時的に保存
let deleteTargetId = null;
let deleteTargetName = null;


// =========================
// 連絡先一覧を表示
// =========================

async function showList() {

    const list = document.getElementById("maillist");

    list.innerHTML = "";

    const snapshot = await getDocs(
        collection(db, "contacts")
    );

    snapshot.forEach((docSnapshot) => {

        const contact = docSnapshot.data();

        const li = document.createElement("li");


        // 名前を表示する部分
        const nameArea = document.createElement("div");

        nameArea.classList.add("name-area");


        const name = document.createElement("strong");

        name.textContent = contact.name;


        // ゴミ箱ボタン
        const deleteButton = document.createElement("button");

        deleteButton.textContent = "×";

        deleteButton.classList.add("delete-button");


        // =========================
        // 削除ボタンを押したとき
        // =========================

        deleteButton.addEventListener("click", () => {

            // 削除する連絡先を保存
            deleteTargetId = docSnapshot.id;

            deleteTargetName = contact.name;


            // 確認画面に名前を表示
            document.getElementById("deleteMessage").textContent =
                `${contact.name}さんの連絡先を削除してもよろしいですか？`;


            // 確認画面を表示
            document.getElementById("deleteModal").style.display = "flex";

        });


        nameArea.appendChild(name);

        nameArea.appendChild(deleteButton);


        // メールアドレス
        const email = document.createElement("div");

        email.innerHTML = `📧 ${contact.email}`;


        li.appendChild(nameArea);

        li.appendChild(email);

        list.appendChild(li);

    });

}


// =========================
// キャンセルボタン
// =========================

document.getElementById("cancelDelete").addEventListener("click", () => {

    // 確認画面を閉じる
    document.getElementById("deleteModal").style.display = "none";

    // 保存していた情報を消す
    deleteTargetId = null;

    deleteTargetName = null;

});


// =========================
// 削除するボタン
// =========================

document.getElementById("confirmDelete").addEventListener("click", async () => {

    // 削除対象がない場合
    if (!deleteTargetId) {
        return;
    }


    try {

        // Firebaseから削除
        await deleteDoc(
            doc(db, "contacts", deleteTargetId)
        );


        // 確認画面を閉じる
        document.getElementById("deleteModal").style.display = "none";


        // 保存していた情報を消す
        deleteTargetId = null;

        deleteTargetName = null;


        // 一覧を更新
        showList();


        alert("削除しました");


    } catch (error) {

        console.error("削除エラー:", error);

        alert("削除できませんでした");

    }

});


// =========================
// 一覧を最初に表示
// =========================

showList();
