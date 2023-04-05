const admin = require("firebase-admin");

//download sdk from firebase
const serviceAccount = require("./mongoro-8bd64-firebase-adminsdk-l2lth-b9799fe295.json");

//get db url too from firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});


exports.firebaseNotification = async (token, title, body, data) => {
    try {


        let payload = {
            data,
            notification: {
                title,
                body
            },
        };

        let options = {
            priority: "high",
            timeToLive: 60 * 60 * 24 * 7
        };

        let sent = await admin
            .messaging()
            .sendToDevice(token, payload, options)
        console.log("Successfully sent message:", sent);
        return sent
    } catch (e) {
        console.log("Error sending message:", e);
        return e
    }

}

exports.ticketID = () => {
    return "0012" + Math.floor(1000 + Math.random() * 9000)
}