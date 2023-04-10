const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const Flutterwave = require('flutterwave-node-v3');
const TransferModel = require('../../../models/mongoro/transaction/api')
const TicketModel = require("../../../models/mongoro/tickets/api")

const Mpos = require("../../../models/mongoro/mpos/mpos_md")
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md");
const AuditModel = require('../../../models/mongoro/auth/user/audit/audit_md');


router.get("/transaction/:key", async (req, res) => {
    try {

        const data = await TransferModel.find(
            {
                "$or": [
                    { transaction_ID: { $regex: req.params.key } },
                    // { Date: { $regex: req.params.key } },
                    { narration: { $regex: req.params.key } },
                    { account_number: { $regex: req.params.key } },
                    { full_name: { $regex: req.params.key } },
                    { bank_name: { $regex: req.params.key } },
                    { reference: { $regex: req.params.key } },
                    { amount: { $regex: req.params.key } },
                    { status: { $regex: req.params.key } }
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


router.get("/user/:key", async (req, res) => {
    try {

        const data = await MongoroUserModel.find(
            {
                "$or": [
                    { middle_name: { $regex: req.params.key } },
                    // { Date: { $regex: req.params.key } },
                    { surname: { $regex: req.params.key } },
                    { first_name: { $regex: req.params.key } },
                    { full_name: { $regex: req.params.key } },
                    { phone: { $regex: req.params.key } },
                    { email: { $regex: req.params.key } },
                    { city: { $regex: req.params.key } },
                    { address: { $regex: req.params.key } },
                    { gender: { $regex: req.params.key } }
                ]
            }

        )

        res.status(200).json({
            msg: 'User data fetch Successfully ',
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

router.get("/audit/:key", async (req, res) => {
    try {

        const data = await AuditModel.find(
            {
                "$or": [
                    { ip: { $regex: req.params.key } },
                    // { Date: { $regex: req.params.key } },
                    { message: { $regex: req.params.key } },
                    { device: { $regex: req.params.key } },
                    { name: { $regex: req.params.key } },
                ]
            }

        )

        res.status(200).json({
            msg: 'Audit data fetch Successfully ',
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


router.get("/ticket/:key", async (req, res) => {
    try {

        const data = await TicketModel.find(
            {
                "$or": [
                    { ID: { $regex: req.params.key } },
                    // { Date: { $regex: req.params.key } },
                    { name: { $regex: req.params.key } },
                    { username: { $regex: req.params.key } },
                    { amount: { $regex: req.params.key } },
                    { method: { $regex: req.params.key } },
                    { status: { $regex: req.params.key } }
                ]
            }

        )

        res.status(200).json({
            msg: 'Ticket data fetch Successfully ',
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


router.get("/pos/:key", async (req, res) => {
    try {

        const data = await TicketModel.find(
            {
                "$or": [
                    { business_name: { $regex: req.params.key } },
                    // { Date: { $regex: req.params.key } },
                    { type: { $regex: req.params.key } },
                    { terminalId: { $regex: req.params.key } },
                    { quantity: { $regex: req.params.key } },
                    { terminalId: { $regex: req.params.key } },
                    { state: { $regex: req.params.key } }
                ]
            }

        )

        res.status(200).json({
            msg: 'Mpos data fetch Successfully ',
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
