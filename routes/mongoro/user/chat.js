const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const UserChatModel = require('../../../models/mongoro/auth/user/chat')

router.post('/send', verify, async (req, res) => {

    try {

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


module.exports =router