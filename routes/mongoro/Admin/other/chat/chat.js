const express = require('express')
const router = express.Router()
const AdminChatModel = require('../../../../../models/mongoro/admin/other/chat/otherChat')


router.get("/user/:id",  async (req, res) => {
    try {
        if (!req.params.id ) return res.status(402).json({ msg: 'provide the id ?' })

        let tickets = await UserChatModel.find({ _id: req.params.id })
        res.status(200).json(tickets);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})



module.exports =router
