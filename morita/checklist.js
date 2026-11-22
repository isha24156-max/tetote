
// =====================================
// Firebase
// =====================================

import { initializeApp }
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-auth.js";

import { getFirestore }
    from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

import {
    recordPageView,
    recordFunctionUse
} from "../log.js";


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

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// =====================================
// ログイン状態・画面利用記録
// =====================================

let currentUser = null;
let pageViewRecorded = false;

onAuthStateChanged(auth, async (user) => {
    currentUser = user;

    if (user && !pageViewRecorded) {
        pageViewRecorded = true;

        await recordPageView(
            db,
            user,
            "持ち物チェック画面"
        );
    }
});


// =====================================
// HTMLの要素
// =====================================

const addBtn = document.getElementById("addBtn");
const modal = document.getElementById("modal");
const closeBtn = document.getElementById("closeBtn");
const saveBtn = document.getElementById("saveBtn");

const itemInput = document.getElementById("itemInput");
const itemList = document.getElementById("itemList");

const deleteModal = document.getElementById("deleteModal");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const editBtn = document.getElementById("editBtn");

let targetLi = null;
let isEditMode = false;


// =====================================
// 保存済みの持ち物を読み込む
// =====================================

const savedItems = localStorage.getItem("checklist");

if (savedItems) {
    itemList.innerHTML = savedItems;

    document.querySelectorAll("#itemList li").forEach(li => {
        li.classList.remove("checked");
    });

    document.querySelectorAll(".deleteBtn").forEach(btn => {
        btn.style.display = "none";
    });
}

updateProgress();


// =====================================
// 追加ボタン
// =====================================

addBtn.addEventListener("click", () => {
    modal.classList.remove("hidden");
});


// =====================================
// 閉じるボタン
// =====================================

closeBtn.addEventListener("click", () => {
    modal.classList.add("hidden");
});


// =====================================
// 持ち物を追加
// =====================================

saveBtn.addEventListener("click", async () => {

    const itemName = itemInput.value.trim();

    if (itemName === "") return;

    const li = document.createElement("li");

    li.innerHTML = `
        <input type="checkbox">
        <span class="itemName"></span>
        <button class="deleteBtn">削除</button>
    `;

    // 入力内容を安全に設定
    li.querySelector(".itemName").textContent = itemName;

    itemList.appendChild(li);

    saveItems();
    updateProgress();

    // 利用記録
    await recordFunctionUse(
        db,
        currentUser,
        "持ち物チェック画面",
        "持ち物の追加"
    );

    itemInput.value = "";
    modal.classList.add("hidden");
});


// =====================================
// 編集モード
// =====================================

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


// =====================================
// チェック状態の変更
// =====================================

itemList.addEventListener("change", async (e) => {

    if (e.target.matches('input[type="checkbox"]')) {

        const li = e.target.closest("li");

        li.classList.toggle("checked", e.target.checked);

        updateProgress();

        // 利用記録
        await recordFunctionUse(
            db,
            currentUser,
            "持ち物チェック画面",
            "持ち物のチェック"
        );
    }

});


// =====================================
// 項目全体・削除ボタンのクリック
// =====================================

itemList.addEventListener("click", async (e) => {

    // 削除ボタン
    if (e.target.classList.contains("deleteBtn")) {

        e.stopPropagation();

        targetLi = e.target.closest("li");

        deleteModal.classList.remove("hidden");

        return;
    }

    // チェックボックス自体を押した場合はchangeで処理
    if (e.target.matches('input[type="checkbox"]')) {
        return;
    }

    // 項目のカード部分を押した場合
    const li = e.target.closest("li");

    if (!li) return;

    const checkbox = li.querySelector('input[type="checkbox"]');

    checkbox.checked = !checkbox.checked;

    li.classList.toggle("checked", checkbox.checked);

    updateProgress();

    // 利用記録
    await recordFunctionUse(
        db,
        currentUser,
        "持ち物チェック画面",
        "持ち物のチェック"
    );
});


// =====================================
// 持ち物を保存
// =====================================

function saveItems() {
    localStorage.setItem("checklist", itemList.innerHTML);
}


// =====================================
// 進捗を更新
// =====================================

function updateProgress() {

    const total = document.querySelectorAll("#itemList li").length;

    const checked =
        document.querySelectorAll("#itemList input:checked").length;

    document.getElementById("progressText").textContent =
        `${checked} / ${total}個 完了`;
}


// =====================================
// 削除キャンセル
// =====================================

cancelDeleteBtn.addEventListener("click", () => {

    deleteModal.classList.add("hidden");

    targetLi = null;
});


// =====================================
// 持ち物を削除
// =====================================

confirmDeleteBtn.addEventListener("click", async () => {

    if (targetLi) {

        targetLi.remove();

        saveItems();
        updateProgress();

        // 利用記録
        await recordFunctionUse(
            db,
            currentUser,
            "持ち物チェック画面",
            "持ち物の削除"
        );

        targetLi = null;
    }

    deleteModal.classList.add("hidden");
});
