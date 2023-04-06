const admin = require("firebase-admin");
const MongoroUserModel = require("../models/mongoro/auth/mongoroUser_md")
const NotificationModel = require("../models/mongoro/notification/notification_md")

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
                body,
                color: '#6d0be5'
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

exports.pushNotification = async (token, title, body, data) => {
    try {


        let message = {
            token,
            data,
            notification: {
                title,
                body
            },
            android: {
                priority: "high",
                notification: {
                    channelId: 'channelId',
                    priority: 'max'
                },
            },
        };


        let sent = await admin
            .messaging()
            .send(message)
        console.log("Successfully sent message:", sent);
        return sent
    } catch (e) {
        console.log("Error sending message:", e);
        return e
    }

}

exports.notify = async (username, title, body, data) => {
    try {
        // registration_token

        const user = await MongoroUserModel.findOne({Wallet_ID: username})

        if (user) {

            let note = {
                userId: user.Wallet_ID,
                to: user.Wallet_ID,
                title,
                body
            }

            let notification = await new NotificationModel(note)

            let not = await notification.save()
            console.log(not)

            let sent = await pushNotification(user.registration_token, title, body, data)
            console.log("Successfully sent message:", sent);
        }
    } catch (e) {
        console.log("Error sending message:", e);
        return e
    }

}

exports.ticketID = () => {
    return "0012" + Math.floor(1000 + Math.random() * 9000)
}