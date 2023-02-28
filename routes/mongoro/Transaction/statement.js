const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const Flutterwave = require('flutterwave-node-v3');
const TransferModel = require('../../../models/mongoro/transaction/api')


router.get("/get/:id", async (req, res) => {
    try {
        const user = await TransferModel.find({userId: req.params.id})
        res.send(user);

        if(user){
            const statement = await user.find({$and:[{"Date":{$gte:1676590789236}},{"Date":{$lte:1676590908291}}]})
            res.send(statement);
        }

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


module.exports = router