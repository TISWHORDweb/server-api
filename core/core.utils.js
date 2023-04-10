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

exports.pushNotification = async (token, title, body, campaignId) => {
    try {
        const message = {
            notification: {
                title: title,
                body: body
            },
            data: {campaignId, title, body},
            token: token,
            android: {
                priority: "high",
                notification: {
                    title: title,
                    body: body,
                    sound: "default",
                    priority: 'max',
                    channelId: 'channelId'
                }
            },
            apns: {
                payload: {
                    aps: {
                        sound: "default",
                        content_available: true
                    }
                },
                headers: {
                    'apns-priority': '10',
                },
            }
        }


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

exports.notify = async (id, title, body, campaignId) => {
    try {
        let myToken = 'dy42NkNoS-eqhGS50UDPSd:APA91bHbAgJWBHSV9wix5b5F8CPqjgChMG3yqPhYpjPXzth6PIfWmV-6-nSYK4PVTJDfQZP1rL6fY3X3afWT-EcfBuBb_B-i1LJ28-ZYiv_tU97MCVrePXuQf7xwBnRxE8EKCN540DLK'


        // let token = "fKRkopyISvCZg1oF5taVZI:APA91bGVg9plb_LUgZMOpA4SWiWlavOJAeN_dacilH1eeQnPNPTckLd8BnsqvKNSV37FROC_gP6KkvMR1cHJ5luV2c6QRnMEo7113FGYRv4T8TXzmt2vaZdyL3Xdf1vkMqWzoEJB1F3O"

        // let token = 'c1WvzQkXWEiMr5z9yj4R4E:APA91bEJsSeS7tghRdypBg_RniWEFMqNZ2XxWiElXT1AbG69vDRCGkvcekvLvjEJXJkdwB_BmJiFtKIQ_1Sjr-F-G-qYu26xDXfiW2Q3dJ4O6fPFIYkyhGsKQsJnkpimgppaJzaxW6f1'


        const user = await MongoroUserModel.findOne({_id: id})
        if (user) {
            let token = user.registration_token;

            let note = {
                userId: id,
                to: user.Wallet_ID,
                title,
                body
            }

            let notification = await new NotificationModel(note)
            // console.log(user.registration_token);
            let not = await notification.save()

            // let sent = await this.pushNotification(user.registration_token, title, body, campaignId)
            let sent = await this.pushNotification(token, title, body, campaignId)
            console.log("Successfully sent message:", {note, sent, not});
        }
    } catch (e) {
        console.log("Error sending message:", e);
        return e
    }

}

exports.ticketID = () => {
    return "0012" + Math.floor(1000 + Math.random() * 9000)
}