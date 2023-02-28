const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const Flutterwave = require('flutterwave-node-v3');
const TransferModel = require('../../../models/mongoro/transaction/api')


router.get("/get/:id/:from/:to", async (req, res) => {
    try {

    const statement = await TransferModel.find({ $and: [{ userId: req.params.id }, { "Date": { $gte: req.params.from } }, { "Date": { $lte: req.params.to } }] })

    res.status(200).json({
        msg: 'Account Statement fetch Successfully !!!',
        status: 200,
        statement: statement
    })


    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


module.exports = router