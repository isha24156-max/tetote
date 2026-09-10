import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import {
    getFirestore,
    collection,
    addDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


// Firebaseの設定
const firebaseConfig = {
    apiKey: "AIzaSyA6stEZ00HAtMNEvUzG47zIUArCFJgsfTA",
    authDomain: "tetote-f459b.firebaseapp.com",
    projectId: "tetote-f459b",
    storageBucket: "tetote-f459b.firebasestorage.app",
    messagingSenderId: "4402684573",
    appId: "1:4402684573:web:09529c707357ce437dea74",
    measurementId: "G-CSGLSRBLDR"
};


// Firebaseを初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const registerBtn = document.getElementById("registerBtn");

const nameInput = document.getElementById("nameInput");
const emailInput = document.getElementById("emailInput");

const completeModal = document.getElementById("completeModal");


registerBtn.addEventListener("click", () => {

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();

    // 名前かメールアドレスが空の場合
    if (name === "" || email === "") {
        alert("名前とメールアドレスを入力してください。");
        return;
    }

    // 入力内容を消す
    nameInput.value = "";
    emailInput.value = "";

    // 登録完了を表示
    completeModal.classList.remove("hidden");

    // 2秒後に登録完了を消す
    setTimeout(() => {
        completeModal.classList.add("hidden");
    }, 2000);

});

const homeBtn = document.getElementById("homeBtn");

homeBtn.addEventListener("click", () => {
    window.location.href = "../hada/home.html";
});
