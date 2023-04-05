const {firebaseNotification} = require('../core/core.utils')
const {log} = require("qrcode/lib/core/galois-field");

//regToken | Device ID
let token = "dy42NkNoS-eqhGS50UDPSd:APA91bHbAgJWBHSV9wix5b5F8CPqjgChMG3yqPhYpjPXzth6PIfWmV-6-nSYK4PVTJDfQZP1rL6fY3X3afWT-EcfBuBb_B-i1LJ28-ZYiv_tU97MCVrePXuQf7xwBnRxE8EKCN540DLK"
//Message Payload (Data)

let data = {
    message_kind: "type"
}
let notification = {
    title: "Hi",
    body: `Welcome to Mongoro`,
};

//Send Notification
firebaseNotification(token, notification.title, notification.body, data).then(r => log(r));