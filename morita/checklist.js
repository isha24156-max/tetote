// Firebase
import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import { getFirestore }
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import { recordPageView }
    from "../log.js";

// Firebase設定
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
const auth = getAuth(app);
const db = getFirestore(app);

// ログイン状態を確認して利用記録
let pageViewRecorded = false;

onAuthStateChanged(auth, async (user) => {
    if (user && !pageViewRecorded) {
        pageViewRecorded = true;

        await recordPageView(
            db,
            user,
            "持ち物チェック画面"
        );
    }
});

const addBtn = document.getElementById("addBtn");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.getElementById("saveBtn");

const itemInput = document.getElementById("itemInput");
const itemList = document.getElementById("itemList");

const deleteModal = document.getElementById("deleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

let targetLi = null;

const savedItems = localStorage.getItem("checklist");

if (savedItems) {
    itemList.innerHTML = savedItems;

    document.querySelectorAll("#itemList li").forEach(li => {
        li.classList.remove("checked");
    });

    document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.style.display = "none";
    });

    updateProgress();
}

addBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
});

closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});

saveBtn.addEventListener("click", () => {
    const itemName = itemInput.value.trim();

    if (itemName === "") return;

    const li = document.createElement("li");
    li.innerHTML = `
        <input type="checkbox">
        <span class="itemName">${itemName}</span>
        <button class="deleteBtn">削除</button>
    `;

    // 新しいチェックボックスを取得
    const checkbox = li.querySelector("input");

    // チェック時に色変更
    checkbox.addEventListener("change", () => {
        li.classList.toggle("checked");
        updateProgress();
    });

    // カード全体を押してもチェック
    li.addEventListener("click", (e) => {
        if (e.target.tagName === "INPUT") return;

        checkbox.checked = !checkbox.checked;
        li.classList.toggle("checked");

        updateProgress();
    });

    itemList.appendChild(li);

    saveItems();
    updateProgress();

    itemInput.value = "";
    modal.classList.add("hidden");
});

const editBtn = document.getElementById("editBtn");
const editModeText = document.getElementById("editModeText");

let isEditMode = false;

editBtn.addEventListener("click", () => {
    isEditMode = !isEditMode;

    const deleteBtns = document.querySelectorAll(".deleteBtn");

    if (isEditMode) {
        editBtn.textContent = "完了";
        document.body.classList.add("editMode");
        deleteBtns.forEach(btn => {
            btn.style.display = "block";
        });

    } else {
        editBtn.textContent = "編集";
        document.body.classList.remove("editMode");
        deleteBtns.forEach(btn => {
            btn.style.display = "none";
        });
    }
});

document.querySelectorAll('#itemList input[type="checkbox"]').forEach(checkbox => {
    checkbox.addEventListener("change", () => {
        checkbox.parentElement.classList.toggle("checked");
        updateProgress();
    });
});

document.querySelectorAll("#itemList li").forEach(li => {
    li.addEventListener("click", (e) => {

        if (
            /*e.target.tagName === "INPUT" ||*/
            e.target.closest(".deleteBtn")
        ) return;

        const checkbox = li.querySelector('input[type="checkbox"]');
    
        checkbox.checked = !checkbox.checked;
        li.classList.toggle("checked");

        updateProgress();
    });
});

function saveItems() {
    localStorage.setItem("checklist", itemList.innerHTML);
}

itemList.addEventListener("click", (e) => {

    if (e.target.classList.contains("deleteBtn")) {

        e.stopPropagation();

        targetLi = e.target.parentElement;

        deleteModal.classList.remove("hidden");
    }

});

function updateProgress() {

    const total = document.querySelectorAll("#itemList li").length;

    const checked =
        document.querySelectorAll("#itemList input:checked").length;

    document.getElementById("progressText").textContent =
        `${checked} / ${total}個 完了`;
}

cancelDeleteBtn.addEventListener("click", () => {
    deleteModal.classList.add("hidden");
});

confirmDeleteBtn.addEventListener("click", () => {

    if (targetLi) {
    targetLi.remove();
    saveItems();
    updateProgress();
}

    deleteModal.classList.add("hidden");
});
