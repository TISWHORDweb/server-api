const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const bcrypt = require('bcryptjs')
const BvnDefaultModel = require('../../../models/mongoro/auth/user/verification/u-verify_md')


router.post('/save', verify, async (req, res) => {

    try {
        if (!req.body.userId || !req.body.b_id) return res.status(402).json({ msg: 'provide the id ?' })

        // if (req.body.b_id) {
        //     req.body.b_id = await bcrypt.hash(req.body.b_id, 13)
        // }

        let details = await new BvnDefaultModel(req.body)

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
        const details = await BvnDefaultModel.find();
        res.status(200).json(details.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


router.get("/:id", async (req, res) => {
    try {
        if (!req.params.id ) return res.status(402).json({ msg: 'provide the id ?' })

        let user = await BvnDefaultModel.find({ b_id: req.params.id })
        res.status(200).json(user);

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

module.exports =router