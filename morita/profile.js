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
