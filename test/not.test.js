const {firebaseNotification} = require('../core/core.utils')

//regToken | Device ID
let token = "";

//Message Payload (Data)
let payload = {
    //pass any self-declared optional params here
    data: {
        message_kind: "type"
    },
    notification: {
        title: "Notification title",
        body: `Notification body`,
    },
    token: token,
};

//Send Notification
firebaseNotification(payload);