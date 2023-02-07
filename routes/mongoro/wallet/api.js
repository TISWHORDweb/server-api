const express = require('express')
const router = express.Router()
const WalletModel = require("../../../models/mongoro/wallet/wallet_md")
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

//CREATE
router.put('/create', verify,async (req, res) => {

    try {

        let wallet = await new WalletModel(req.body)

        await wallet.save().then(user => {
            return res.status(200).json({
                msg: 'Wallet created is successful !!!',
                wallet: wallet,
                status: 200
            })
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


router.delete("/delete", verify, async (req, res) => {
    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' })

        await WalletModel.deleteOne({ _id: req.body.id })
        res.status(200).json({msg:"Request deleted....",status: 200});
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

});

router.get("/single", verify, async (req, res) => {
    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?',status: 402 })

        let user = await Mpos.find({ _id: req.body.id })
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


router.put('/transfer', verify, async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    let { id } = body;

    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?',status: 402 })

        await Mpos.updateOne({ _id: id }, body).then(async () => {
            let user = await Mpos.findOne({ _id: id })
            return res.status(200).json({
                msg: 'Deposit Successful !!!',
                user: user,
                status: 200
            })
        }).catch((err) => {
            res.send(err)
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

})


module.exports = router

