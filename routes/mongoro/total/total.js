const express = require('express')
const router = express.Router()
const MongoroUserModel = require('../../../models/mongoro/auth/mongoroUser_md')
const TransferModel = require('../../../models/mongoro/transaction/api')
const dotenv = require("dotenv")
dotenv.config()
const TicketModel = require('../../../models/mongoro/tickets/api')

router.get("/totals", async (req, res) => {
    try {

    /*
    Totals based on dates
     */
    const oneDayAgoTimeStamp = Date.now() - (24 * 60 * 60 * 1000);
    const oneWeekAgoTimeStamp = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const oneMonthAgoTimeStamp = Date.now() - (30 * 24 * 60 * 60 * 1000);


    //--------------------------------Deposits------------------------------

    const totalDeposit = await TransferModel.aggregate([
        {
            $match: {
                service_type: "Deposit",
            }
        },

        {
            $group: {
                _id: null,
                "total": {
                    '$sum': {
                        '$convert': {'input': '$amount', 'to': 'int'}
                    }
                }
            }
        }
    ])

    //TODAY"S DEPOSIT
    const dailyDeposit = await TransferModel.aggregate([
        {
            $match: {
                service_type: "Deposit",
                Date: {
                    $gte: oneDayAgoTimeStamp
                }
            }
        },

        {
            $group: {
                _id: null,
                "total": {
                    '$sum': {
                        '$convert': {'input': '$amount', 'to': 'int'}
                    }
                }
            }
        }
    ])

    //THIS WEEK"S DEPOSIT
    const weeklyDeposit = await TransferModel.aggregate([
        {
            $match: {
                Date: {
                    $gte: oneWeekAgoTimeStamp
                },
                service_type: "Deposit"
            }
        },
        {
            $group: {
                _id: null,
                "Total": {
                    '$sum': {
                        '$convert': {'input': '$amount', 'to': 'int'}
                    }
                }
            }
        }
    ])

    //THIS MONTH"S DEPOSITS
    const monthlyDeposit = await TransferModel.aggregate([
        {
            $match: {
                Date: {
                    $gte: oneMonthAgoTimeStamp
                },
                service_type: "Deposit"
            }
        },
        {
            $group: {
                _id: null,
                "Total": {
                    '$sum': {
                        '$convert': {'input': '$amount', 'to': 'int'}
                    }
                }
            }
        }
    ])

    //--------------------------------Withdrawals------------------------------

    const totalWithdrawal = await TransferModel.aggregate([
        {
            $match: {
                service_type: "Transfer",
            }
        },

        {
            $group: {
                _id: null,
                "total": {
                    '$sum': {
                        '$convert': {'input': '$amount', 'to': 'int'}
                    }
                }
            }
        }
    ])

    //TODAY"S WITHDRAWALS
    const dailyWithdrawal = await TransferModel.aggregate([
        {
            $match: {
                service_type: "Transfer",
                Date: {
                    $gte: oneDayAgoTimeStamp
                }
            }
        },

        {
            $group: {
                _id: null,
                "total": {
                    '$sum': {
                        '$convert': {'input': '$amount', 'to': 'int'}
                    }
                }
            }
        }
    ])

    // THIS WEEK"S WITHDRAWALS
    const weeklyWithdrawal = await TransferModel.aggregate([
        {
            $match: {
                service_type: "Transfer",
                Date: {
                    $gte: oneWeekAgoTimeStamp
                }
            }
        },

        {
            $group: {
                _id: null,
                "total": {
                    '$sum': {
                        '$convert': {'input': '$amount', 'to': 'int'}
                    }
                }
            }
        }
    ])

    // THIS MONTH"S WITHDRAWALS
    const monthlyWithdrawal = await TransferModel.aggregate([
        {
            $match: {
                service_type: "Transfer",
                Date: {
                    $gte: oneMonthAgoTimeStamp
                }
            }
        },

        {
            $group: {
                _id: null,
                "total": {
                    '$sum': {
                        '$convert': {'input': '$amount', 'to': 'int'}
                    }
                }
            }
        }
    ])

    //--------------------------------Bills------------------------------

    const totalBill = await TransferModel.aggregate([
        {
            $match: {
                service_type: "Bills",
            }
        },

        {
            $group: {
                _id: null,
                "total": {
                    '$sum': {
                        '$convert': {'input': '$amount', 'to': 'int'}
                    }
                }
            }
        }
    ])

    //TODAY"S BILLS
    const dailyBill = await TransferModel.aggregate([
        {
            $match: {
                service_type: "Bills",
                Date: {
                    $gte: oneDayAgoTimeStamp
                }
            }
        },

        {
            $group: {
                _id: null,
                "total": {
                    '$sum': {
                        '$convert': {'input': '$amount', 'to': 'int'}
                    }
                }
            }
        }
    ])

    // THIS WEEK"S BILLS
    const weeklyBill = await TransferModel.aggregate([
        {
            $match: {
                service_type: "Bills",
                Date: {
                    $gte: oneWeekAgoTimeStamp
                }
            }
        },

        {
            $group: {
                _id: null,
                "total": {
                    '$sum': {
                        '$convert': {'input': '$amount', 'to': 'int'}
                    }
                }
            }
        }
    ])

    // THIS MONTH"S BILLS
    const monthlyBill = await TransferModel.aggregate([
        {
            $match: {
                service_type: "Bills",
                Date: {
                    $gte: oneMonthAgoTimeStamp
                }
            }
        },

        {
            $group: {
                _id: null,
                "total": {
                    '$sum': {
                        '$convert': {'input': '$amount', 'to': 'int'}
                    }
                }
            }
        }
    ])

    /*
    END Totals based on dates
     */

    //TOTAL USER
    const count = await MongoroUserModel.countDocuments();

    //TOTAL TRANSACTION
    // const transaction = await TransferModel.aggregate([{
    //     $match: {
    //         service_type: "Transfer"
    //     }
    // }, {
    //     $group: {
    //         _id: null,
    //         "TotalTransaction": {
    //             '$sum': {
    //                 '$convert': {'input': '$amount', 'to': 'int'}
    //             }
    //         }
    //     }
    // }])

    //TOTAL SAVING
    const saving = await MongoroUserModel.aggregate([{
        $group: {
            _id: null,
            "TotalSaving": {
                '$sum': {
                    '$convert': {'input': '$wallet_balance', 'to': 'int'}
                }
            }
        }
    }])

    //ACTIVE USER
    const active = await MongoroUserModel.find({active: true})

    //INACTIVE USER
    const inactive = await MongoroUserModel.find({active: false})

    //TICKETS
    const ticket = await TicketModel.countDocuments();


    res.status(200).json({
        Total_user: count,
        transaction,
        totalDeposit,
        dailyDeposit,
        weeklyDeposit,
        monthlyDeposit,
        totalWithdrawal,
        dailyWithdrawal,
        weeklyWithdrawal,
        monthlyWithdrawal,
        totalBill,
        dailyBill,
        weeklyBill,
        monthlyBill,
        saving,
        TotalActive: active.length,
        TotalInactive: inactive.length,
        Total_tickets: ticket
    });
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.get("/user", async (req, res) => {
    try {
        const count = await MongoroUserModel.countDocuments();
        res.status(200).json({total_user: count});
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
                        '$convert': {'input': '$amount', 'to': 'int'}
                    }
                },
                service_type: "Transfer"
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
                        '$convert': {'input': '$wallet_balance', 'to': 'int'}
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

        const active = await MongoroUserModel.find({active: true})

        res.status(200).json({TotalActive: active.length})

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

})

router.get("/inactive", async (req, res) => {

    try {

        const inactive = await MongoroUserModel.find({active: false})

        res.status(200).json({TotalInactive: inactive.length})

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
        res.status(200).json({Total_tickets: count});
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


module.exports = router