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


async function showList(){

    const list = document.getElementById("mailList");

    list.innerHTML = "";

    console.log("showList開始");

    const snapshot = await getDocs(collection(db, "contacts"));

    console.log(snapshot);


    snapshot.forEach((doc)=>{

        console.log(doc.data());

        const contact = doc.data();

       const li = document.createElement("li");

li.innerHTML = `
    <strong>${contact.name}</strong><br>
    📧 ${contact.email}
`;

const deleteButton = document.createElement("button");

deleteButton.textContent = "削除";

deleteButton.classList.add("delete-button");

deleteButton.addEventListener("click", async () => {

    const result = confirm(
        `${contact.name}さんの連絡先を削除しますか？`
    );

    if (!result) {
        return;
    }

    await deleteDoc(
        doc(db, "contacts", docSnapshot.id)
    );

    alert("削除しました");

    showList();

});

li.appendChild(deleteButton);
list.appendChild(li);
showList();
