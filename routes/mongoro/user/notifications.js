const express = require('express')
const router = express.Router()
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")


router.post('/widget/email', async (req, res) => {

    try {
        if (!req.body.recipent || !req.body.message || !req.body.type) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let widget = await new BroadcastModel(req.body)

        await widget.save().then(widget => {
            MongoroUserModel.updateOne({ email: req.body.recipent }, { $set: { widget: { message: req.body.message, subject: req.body.subject, send_at: Date.now() } } }).then(async () => {
            })
            return res.status(200).json({
                msg: 'widget sent successful ',
                widget: widget,
                status: 200
            })
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})