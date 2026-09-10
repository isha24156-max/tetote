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


async function showList() {

    const list = document.getElementById("mailList");

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

        // 削除ボタン
        deleteButton.addEventListener("click", async () => {

            const result = confirm(
                `${contact.name}さんの連絡先を削除しますか？`
            );

            if (!result) {
                return;
            }

            try {

                await deleteDoc(
                    doc(db, "contacts", docSnapshot.id)
                );

                alert("削除しました");

                showList();

            } catch (error) {

                console.error("削除エラー:", error);

                alert("削除できませんでした");

            }

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

showList();
