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


// 削除する連絡先を一時保存
let deleteTargetId = null;


// =============================
// 連絡先一覧を表示
// =============================

async function showList() {

    const list = document.getElementById("mailList");

    if (!list) {
        console.error("mailListが見つかりません");
        return;
    }

    list.innerHTML = "";

    try {

        const snapshot = await getDocs(
            collection(db, "contacts")
        );

        snapshot.forEach((docSnapshot) => {

            const contact = docSnapshot.data();

            const li = document.createElement("li");


            // 名前
            const nameArea = document.createElement("div");
            nameArea.classList.add("name-area");

            const name = document.createElement("strong");
            name.textContent = contact.name;


            // 削除ボタン
            const deleteButton = document.createElement("button");

            deleteButton.textContent = "×";
            deleteButton.classList.add("delete-button");


            // =============================
            // 削除ボタンを押したとき
            // =============================

            deleteButton.addEventListener("click", () => {

                deleteTargetId = docSnapshot.id;

                document.getElementById("deleteMessage").textContent =
                    `${contact.name}さんの連絡先を削除してもよろしいですか？`;

                document.getElementById("deleteModal").style.display = "flex";

            });


            nameArea.appendChild(name);
            nameArea.appendChild(deleteButton);


            // メールアドレス
            const email = document.createElement("div");

            email.textContent = `📧 ${contact.email}`;


            li.appendChild(nameArea);
            li.appendChild(email);

            list.appendChild(li);

        });

    } catch (error) {

        console.error("連絡先の取得エラー:", error);

    }

}


// =============================
// キャンセル
// =============================

document.getElementById("cancelDelete").addEventListener("click", () => {

    document.getElementById("deleteModal").style.display = "none";

    deleteTargetId = null;

});


// =============================
// 削除する
// =============================

document.getElementById("confirmDelete").addEventListener("click", async () => {

    if (!deleteTargetId) {
        return;
    }

    try {

        await deleteDoc(
            doc(db, "contacts", deleteTargetId)
        );


        // 確認画面を閉じる
        document.getElementById("deleteModal").style.display = "none";

        deleteTargetId = null;


        // 一覧を更新
        showList();


    } catch (error) {

        console.error("削除エラー:", error);

        alert("削除できませんでした");

    }

});


// =============================
// 最初に一覧を表示
// =============================

showList();
