const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const Flutterwave = require('flutterwave-node-v3');
const TransferModel = require('../../../models/mongoro/transaction/api')



router.get("/get", async (req, res) => {
    // try {

    // let user = await TransferModel.find()
    // res.status(200).json(user);

    // const query = { "amount": { "$gte": 1000, "$lte": 200 } }
    const statement = await TransferModel.find({
        $and: [
            {
                amount: {
                    $gt: 1000
                }
            },
            {
                amount: {
                    $lt: 100
                }
            }
        ]
    })

    res.send(statement)

    // } catch (err) {
    //     res.status(500).json({
    //         msg: 'there is an unknown error sorry !',
    //         status: 500
    //     })
    // }
})

module.exports = router
