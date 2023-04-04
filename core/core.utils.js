const admin = require("firebase-admin");

//download sdk from firebase
const serviceAccount = require("./mind-interest-firebase-adminsdk-ppx15-554cdb8cab.json");

//get db url too from firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://mindinteresttestapp-default-rtdb.firebaseio.com",
});


exports.firebaseNotification = (payload) => {
    const options = {
        priority: "high",
        timeToLive: 60 * 60 * 24,
    };

    admin
        .messaging()
        .send(payload)
        .then((response) => {
            console.log("Successfully sent message:", response);
            return response
        })
        .catch((error) => {
            console.log("Error sending message:", error);
            return error
        });
}