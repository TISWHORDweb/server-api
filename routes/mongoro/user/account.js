const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const bcrypt = require('bcryptjs')
const AccountModel = require('../../../models/mongoro/auth/user/virtual account/virtual_account_md')


router.post('/save', verify, async (req, res) => {

    try {
        if (!req.body.userId) return res.status(402).json({ msg: 'provide the id ?' })

        let details = await new AccountModel(req.body)

        await details.save().then(details => {
            return res.status(200).json({
                msg: 'Details saved!!!',
                details: details,
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

router.get("/all", async (req, res) => {
    try {
        const details = await AccountModel.find();
        res.status(200).json(details.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


module.exports =router