const {firebaseNotification} = require('../core/core.utils')

//regToken | Device ID
let token = "dy42NkNoS-eqhGS50UDPSd:APA91bHbAgJWBHSV9wix5b5F8CPqjgChMG3yqPhYpjPXzth6PIfWmV-6-nSYK4PVTJDfQZP1rL6fY3X3afWT-EcfBuBb_B-i1LJ28-ZYiv_tU97MCVrePXuQf7xwBnRxE8EKCN540DLK"
//Message Payload (Data)
let payload = {
    //pass any self-declared optional params here
    data: {
        message_kind: "type"
    },
    notification: {
        title: "Hi",
        body: `Welcome to Mongoro`,
    },
};

//Send Notification
firebaseNotification(token, payload.notification.title, payload.notification.body, payload.data);