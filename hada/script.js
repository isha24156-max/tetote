function sendSafetyMail() {

    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(function(position) {

            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            const subject = "安否確認";

            const body =
                "私は無事です。\n\n" +
                "現在地はこちらです。\n" +
                "https://www.google.com/maps?q=" + lat + "," + lng;

            window.location.href =
                "mailto:family@example.com?subject=" +
                encodeURIComponent(subject) +
                "&body=" +
                encodeURIComponent(body);

        });

    } else {

        alert("位置情報が取得できません。");

    }

}