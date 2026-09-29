function showMessage(message, onClose) {
    const modal = document.getElementById("messageModal");
    const messageText = document.getElementById("messageText");
    const okButton = document.getElementById("messageOk");

    messageText.textContent = message;
    modal.hidden = false;

    okButton.onclick = () => {
        modal.hidden = true;

        if (onClose) {
            onClose();
        }
    };
}
