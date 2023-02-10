const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const UserChatModel = require('../../../models/mongoro/auth/user/chat')
const AdminChatModel = require('../../../models/mongoro/admin/other/chat/otherChat')


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

        let chat = await UserChatModel.find({ userId: req.params.id })
        res.status(200).json(chat);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})
router.put('/edit', async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    let { id } = body;

    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?',status: 402 })

        await UserChatModel.updateOne({ _id: id }, body).then(async () => {
           
            let chat = await UserChatModel.findOne({ _id: id })

            return res.status(200).json({
                msg: 'Admin chat Updated Successfully !!!',
                chat: chat,
                status: 200
            })
        }).catch((err) => {
            res.send(err)
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

})

module.exports =router