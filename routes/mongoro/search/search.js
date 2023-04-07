const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const Flutterwave = require('flutterwave-node-v3');
const TransferModel = require('../../../models/mongoro/transaction/api')
const TicketModel = require("../../../models/mongoro/tickets/api")
const Mpos = require("../../../models/mongoro/mpos/mpos_md")
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")


router.get("/transactions/:key", async (req, res) => {
    try {

        const data = await TransferModel.find(
            {
                "$or": [
                    { name: { $regex: req.params.key } },
                    { brand: { $regex: req.params.key } }
                ]
            }
        )
        res.status(200).json({
            msg: 'Transaction data fetch Successfully ',
            status: 200,
            data: data
        })

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})



module.exports = router