const consentCheckbox = document.getElementById("consentCheckbox");
const nextBtn = document.getElementById("nextBtn");

// すでに同意している場合は、この画面を表示しない
if (localStorage.getItem("consentAgreed") === "true") {
    window.location.href = "../yamamoto/login.html";
}

consentCheckbox.addEventListener("change", () => {
    nextBtn.disabled = !consentCheckbox.checked;
});

nextBtn.addEventListener("click", () => {

    // 同意したことを保存
    localStorage.setItem("consentAgreed", "true");

    // 次の画面へ
    window.location.href = "../yamamoto/login.html";
});
