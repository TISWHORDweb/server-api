const express = require('express')
const router = express.Router()
const MongoroUserModel = require('../../../models/mongoro/auth/mongoroUser_md')
const TransferModel = require('../../../models/mongoro/transaction/api')
const dotenv = require("dotenv")
dotenv.config()
const TicketModel = require('../../../models/mongoro/tickets/api')

router.get("/totals", async (req, res) => {
    // try {
        //TOTAL USER
        const count = await MongoroUserModel.countDocuments();

        //TOTAL TRANSACTION
        const transaction = await TransferModel.aggregate([{
            $group: {
                _id: null,
                "TotalTransaction": {
                    '$sum': {
                        '$convert': { 'input': '$amount', 'to': 'int' }
                    }
                }
            }
        }])

        //TOTAL SAVING
        const saving = await MongoroUserModel.aggregate([{
            $group: {
                _id: null,
                "TotalSaving": {
                    '$sum': {
                        '$convert': { 'input': '$wallet_balance', 'to': 'int' }
                    }
                }
            }
        }])

        //ACTIVE USER
        const active = await MongoroUserModel.find({ active: true })

        //INACTIVE USER
        const inactive = await MongoroUserModel.find({ active: false })

        //TICKETS
        const ticket = await TicketModel.countDocuments();


        res.status(200).json({ Total_user: count, transaction, saving, TotalActive: active.length, TotalInactive: inactive.length,  Total_tickets: ticket });
    // } catch (err) {
    //     res.status(500).json({
    //         msg: 'there is an unknown error sorry !',
    //         status: 500
    //     })
    // }
})

router.get("/user", async (req, res) => {
    try {
        const count = await MongoroUserModel.countDocuments();
        res.status(200).json({ total_user: count });
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.get("/transaction", async (req, res) => {

    try {

        const rest = await TransferModel.aggregate([{
            $group: {
                _id: null,
                "TotalTransaction": {
                    '$sum': {
                        '$convert': { 'input': '$amount', 'to': 'int' }
                    }
                }
            }
        }])

        res.status(200).json(rest)

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

})

router.get("/saving", async (req, res) => {

    try {

        const rest = await MongoroUserModel.aggregate([{
            $group: {
                _id: null,
                "TotalSaving": {
                    '$sum': {
                        '$convert': { 'input': '$wallet_balance', 'to': 'int' }
                    }
                }
            }
        }])

        res.status(200).json(rest)

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

})


router.get("/active", async (req, res) => {

    try {

        const active = await MongoroUserModel.find({ active: true })

        res.status(200).json({ TotalActive: active.length })

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

})

router.get("/inactive", async (req, res) => {

    try {

        const inactive = await MongoroUserModel.find({ active: false })

        res.status(200).json({ TotalInactive: inactive.length })

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

})

router.get("/ticket", async (req, res) => {
    try {
        const count = await TicketModel.countDocuments();
        res.status(200).json({ Total_tickets: count });
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})



module.exports = router