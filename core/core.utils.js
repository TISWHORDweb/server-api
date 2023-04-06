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
        // let token = 'dy42NkNoS-eqhGS50UDPSd:APA91bHbAgJWBHSV9wix5b5F8CPqjgChMG3yqPhYpjPXzth6PIfWmV-6-nSYK4PVTJDfQZP1rL6fY3X3afWT-EcfBuBb_B-i1LJ28-ZYiv_tU97MCVrePXuQf7xwBnRxE8EKCN540DLK'

        const user = await MongoroUserModel.findOne({Wallet_ID: username})
        if (user) {

            let note = {
                userId: username,
                to: user.email,
                title,
                body
            }

            let notification = await new NotificationModel(note)
            // console.log(user.registration_token);
            let not = await notification.save()

            let sent = await this.pushNotification(user.registration_token, title, body, data)
            // let sent = await this.pushNotification(token, title, body, data)
            console.log("Successfully sent message:", not);
        }
    } catch (e) {
        console.log("Error sending message:", e);
        return e
    }

}

exports.ticketID = () => {
    return "0012" + Math.floor(1000 + Math.random() * 9000)
}