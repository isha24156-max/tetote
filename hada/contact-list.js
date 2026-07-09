let contacts = JSON.parse(localStorage.getItem("contacts")) || [];

function showList(){

    const list = document.getElementById("mailList");

    list.innerHTML = "";

    contacts.forEach(function(contact,index){

        list.innerHTML += `
        <li>
            <strong>${contact.name}</strong><br>
            📧 ${contact.mail}<br>

            <button onclick="deleteContact(${index})">
                削除
            </button>

        </li>

        <br>
        `;
    });

}

/*function showList(){

    const list=document.getElementById("mailList");

    list.innerHTML="";

    contacts.forEach(function(contact){

        list.innerHTML +=
        `
        <li>
            <strong>${contact.name}</strong><br>
            📧 ${contact.mail}
        </li>
        <br>
        `;

    });

    function deleteContact(index){

        if(confirm("削除しますか？")){
    
            contacts.splice(index,1);
    
            localStorage.setItem(
                "contacts",
                JSON.stringify(contacts)
            );
    
            showList();
    
        }
    
    }

}*/

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";


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

    console.log("showList開始");

    const snapshot = await getDocs(collection(db, "contacts"));

    console.log(snapshot);


    snapshot.forEach((doc)=>{

        console.log(doc.data());

        const contact = doc.data();

        list.innerHTML += `
        <li>
            <strong>${contact.name}</strong><br>
            📧 ${contact.email}
        </li>
        `;

    });

}

showList();
