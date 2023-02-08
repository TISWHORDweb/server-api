const express = require('express')
const router = express.Router()
const WalletModel = require("../../../models/mongoro/auth/mongoroUser_md")
const verify = require("../../../verifyToken")

router.get("/all", verify, async (req, res) => {
    try {
        const wallet = await WalletModel.find();
        res.status(200).json(wallet.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})




module.exports = router
