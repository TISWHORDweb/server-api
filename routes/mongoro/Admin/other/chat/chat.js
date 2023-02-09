const express = require('express')
const webpush = require('web-push');
const router = express.Router()

const publicVapidKey = process.env.PUBLIC_VAPID_KEY;
const privateVapidKey = process.env.PRIVATE_VAPID_KEY;


router.post('/notify', async (req, res) => {

    try {
        webpush.setVapidDetails('mailto:ebatimehin@gmail.com', publicVapidKey, privateVapidKey);
       const subscription = req.body

       const payload = JSON.stringify({ title: "New Message"})

       await webpush.sendNotification(subscription, payload)

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})



module.exports =router