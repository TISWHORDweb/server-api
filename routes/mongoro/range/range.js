const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const Flutterwave = require('flutterwave-node-v3');
const TransferModel = require('../../../models/mongoro/transaction/api')
const TicketModel = require("../../../models/mongoro/tickets/api")
const Mpos = require("../../../models/mongoro/mpos/mpos_md")
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")

router.get("/transaction/:from/:to", async (req, res) => {
    try {

    const statement = await TransferModel.find({ $and: [{ "Date": { $gte: req.params.from } }, { "Date": { $lte: req.params.to } }] })
   
    res.status(200).json({
        msg: 'Transaction fetch Successfully ',
        status: 200,
        statement: statement
    })

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.get("/withdraw/:from/:to", async (req, res) => {
    try {

    const statement = await TransferModel.find({ $and: [{ service_type: "Transfer" }, { "Date": { $gte: req.params.from } }, { "Date": { $lte: req.params.to } }] })
   
    res.status(200).json({
        msg: 'Withdraw data fetch Successfully ',
        status: 200,
        statement: statement
    })

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})


router.get("/deposit/:from/:to", async (req, res) => {
    try {

    const statement = await TransferModel.find({ $and: [{ service_type: "Deposit" }, { "Date": { $gte: req.params.from } }, { "Date": { $lte: req.params.to } }] })

    res.status(200).json({
        msg: 'Deposit data fetch Successfully ',
        status: 200,
        statement: statement
    })

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})


router.get("/ticket/:from/:to", async (req, res) => {
    try {

    const statement = await TicketModel.find({ $and: [{ "time_created": { $gte: req.params.from } }, { "time_created": { $lte: req.params.to } }] })

    res.status(200).json({
        msg: 'Ticket data fetch Successfully ',
        status: 200,
        statement: statement
    })

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.get("/mpos/:from/:to", async (req, res) => {
    try {

    const statement = await Mpos.find({ $and: [{ "time_created": { $gte: req.params.from } }, { "time_created": { $lte: req.params.to } }] })

    res.status(200).json({
        msg: 'MPOS data fetch Successfully ',
        status: 200,
        statement: statement
    })

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.get("/user/:from/:to", async (req, res) => {
    try {

    const statement = await MongoroUserModel.find({ $and: [{ "time_created": { $gte: req.params.from } }, { "time_created": { $lte: req.params.to } }] })

    res.status(200).json({
        msg: 'Users data fetch Successfully ',
        status: 200,
        statement: statement
    })

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

module.exports = router