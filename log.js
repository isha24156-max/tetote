import {
    getFirestore,
    collection,
    addDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.15.0/firebase-firestore.js";

// 画面を開いた記録を保存
export async function recordPageView(db, user, screenName) {
    if (!user) return;

    try {
        await addDoc(collection(db, "usage_logs"), {
            userId: user.uid,
            screen: screenName,
            type: "page_view",
            timestamp: serverTimestamp()
        });
        console.log("画面の利用記録を保存しました");
    } catch (error) {
        console.error("利用記録の保存に失敗しました", error);
    }
}

// 機能を使った記録を保存
export async function recordFunctionUse(db, user, screenName, functionName) {
    if (!user) return;

    try {
        await addDoc(collection(db, "usage_logs"), {
            userId: user.uid,
            screen: screenName,
            type: "function_use",
            functionName: functionName,
            timestamp: serverTimestamp()
        });
        console.log("機能の利用記録を保存しました");
    } catch (error) {
        console.error("機能の利用記録の保存に失敗しました", error);
    }
}
