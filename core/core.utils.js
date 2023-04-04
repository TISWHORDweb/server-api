const admin = require("firebase-admin");

//download sdk from firebase
const serviceAccount = require("./mongoro-8bd64-firebase-adminsdk-l2lth-b9799fe295.json");

//get db url too from firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
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



// admin
//     .messaging().sendToDevice(reqToken, payload, options)
//     .then((response) => {
//         console.log("Successfully sent message:", response.results);
//         return response
//     })
//     .catch((error) => {
//         console.log("Error sending message:", error);
//         return error
//     });