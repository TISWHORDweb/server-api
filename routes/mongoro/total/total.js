const express = require('express')
const router = express.Router()
const MongoroUserModel = require('../../../models/mongoro/auth/mongoroUser_md')
const TransferModel = require('../../../models/mongoro/transaction/api')
const dotenv = require("dotenv")
const { response } = require('express')
dotenv.config()



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
    
    // try {

    const rest = await MongoroUserModel.aggregate([{
        $group: {
            _id: null,
            "TotalSaving":  {
                $sum: "$wallet_balance"
             }
        }
    }])

    res.status(200).json(rest)
   
    // } catch (err) {
    //     res.status(500).json({
    //         msg: 'there is an unknown error sorry !',
    //         status: 500
    //     })
    // }

})


module.exports = router
