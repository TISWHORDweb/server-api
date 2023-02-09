const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const UserChatModel = require('../../../models/mongoro/auth/user/chat')

router.post('/send', verify, async (req, res) => {

    try {
        if (!req.body.userId) return res.status(402).json({ msg: 'provide the id ?' })

        let chat = await new UserChatModel(req.body)

        await chat.save().then(chat => {
            return res.status(200).json({
                msg: 'Message send!!!',
                chat: chat,
                status: 200
            })
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.get("/:id", verify, async (req, res) => {
    try {
        if (!req.params.id ) return res.status(402).json({ msg: 'provide the id ?' })

        let tickets = await UserChatModel.find({ userId: req.params.id })
        res.status(200).json(tickets);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


module.exports =router