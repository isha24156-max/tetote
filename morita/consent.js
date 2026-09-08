const consentCheckbox = document.getElementById("consentCheckbox");
const nextBtn = document.getElementById("nextBtn");

consentCheckbox.addEventListener("change", () => {
    nextBtn.disabled = !consentCheckbox.checked;
});

nextBtn.addEventListener("click", () => {
    window.location.href = "../hana/mail.html";
});
