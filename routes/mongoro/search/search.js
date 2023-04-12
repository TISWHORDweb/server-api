const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const Flutterwave = require('flutterwave-node-v3');
const TransferModel = require('../../../models/mongoro/transaction/api')
const TicketModel = require("../../../models/mongoro/tickets/api")

const Mpos = require("../../../models/mongoro/mpos/mpos_md")
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md");
const AuditModel = require('../../../models/mongoro/auth/user/audit/audit_md');


router.get("/transaction/:key/:status?", async (req, res) => {
    try {
        let check;
        if (!!req.params.status) {
            check = {
                $and: [
                    {service_type: {$regex: '.*' + req.params.status + '.*', $options: 'i'}}
                ],
            }
        }
        const data = await TransferModel.find(
            {
                ...check,
                $or: [
                    {transaction_ID: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {narration: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {account_number: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {full_name: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {bank_name: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {reference: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {amount: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {status: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {status_type: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
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
                    {middle_name: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    // { Date: { $regex: req.params.key } },
                    {surname: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {first_name: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {full_name: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {phone: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {email: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {city: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {address: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {gender: {$regex: '.*' + req.params.key + '.*', $options: 'i'}}
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
                    {ip: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    // { Date: { $regex: req.params.key } },
                    {message: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {device: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {name: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
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
                    {ID: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    // { Date: { $regex: req.params.key } },
                    {name: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {username: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {amount: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {method: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {status: {$regex: '.*' + req.params.key + '.*', $options: 'i'}}
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

        const data = await Mpos.find(
            {
                "$or": [
                    {business_name: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    // { Date: { $regex: req.params.key } },
                    {type: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {terminalId: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {quantity: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {address: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {state: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {city: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {country: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {terminalId: {$regex: '.*' + req.params.key + '.*', $options: 'i'}},
                    {state: {$regex: '.*' + req.params.key + '.*', $options: 'i'}}
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
