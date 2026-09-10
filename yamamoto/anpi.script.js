function sendSafetyMail() {
    const confirmSend = confirm(
        "登録している連絡先に「無事です」と送信しますか？"
    );

    if (!confirmSend) {
        return;
    }

    // 安否確認を送信する処理
    alert("安否確認を送信しました。");
}
