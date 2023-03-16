const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const CryptoJS = require("crypto-js")
const axios = require('axios')
const Flutterwave = require('flutterwave-node-v3');
const MongoroUserModel = require('../../../models/mongoro/auth/mongoroUser_md')
const BvnDefaultModel = require('../../../models/mongoro/auth/user/verification/u-verify_md')



router.post('/', async (req, res) => {

    const bvv = CryptoJS.AES.encrypt(req.body.b_id, "mongoro").toString()
    const userId = req.body.userId

    const check = req.body.b_id.substr(req.body.b_id.length - 4)
    console.log(check)

    const url = "https://api.youverify.co/v2/api/identity/ng/bvn"

    const header = {
        headers: {
            token: process.env.U_VERIFY_KEY
        }
    }
    const validate = await BvnDefaultModel.findOne({ check: "MON" + check + "GORO" })

    if (validate) {
        const checking = validate.data.data
        const val = checking.validations.data

        console.log(val)
        if (val.firstName.value !== req.body.firstName) {
            res.send({ msg: 'firstName does not match...' })
        } else if (val.lastName.value !== req.body.lastName) {
            res.send({ msg: 'lastname does not match...' })
        } else {

            MongoroUserModel.updateOne({ _id: userId }, { $set: { verification: { bvn: true }, verification_number: bvv, tiers: "one" } }).then(() => {
                res.send(validate)
                console.log("already")
            })

        }
    } else {

        axios.post(url, {
            "id": req.body.b_id,
            "isSubjectConsent": true,
            "validations": {
                "data": {
                    "lastName": req.body.lastName,
                    "firstName": req.body.firstName
                }
            }

        }, header).then(resp => {
            const data = resp.data.data
            const val = data.validations.data

            if (val.firstName.validated !== true) {
                res.status(400).json({ msg: 'firstName does not match ?' })
            }
            else if (val.lastName.validated !== true) {
                res.status(400).json({ msg: 'lastname does not match ?' })
            } else {
                console.log({ msg: "All details match " })

                const bodys = {
                    "check": "MON" + check + "GORO",
                    "data": resp.data,
                    "userId": req.body.userId
                }

                let details = new BvnDefaultModel(bodys)
                details.save()
                
                MongoroUserModel.updateOne({ _id: userId }, { $set: { verification: { bvn: true }, verification_number: bvv, tiers: "one" } }).then(()=>{
                    res.send(details)
                })

            }

        })
    }
})


router.get("/banks", async (req, res) => {
    const url = "https://api.youverify.co/v2/api/identity/ng/bank-account-number/bank-list"

    const header = {
        headers: {
            token: process.env.U_VERIFY_KEY
        }
    }
    try {
        await axios.get(url, header).then(resp => {
            res.status(200).json(resp.data)
        })
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})



router.get("/all", async (req, res) => {
    try {
        const details = await BvnDefaultModel.find();
        res.status(200).json(details.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.post('/details', async (req, res) => {

    try {

        const details = {
            account_number: req.body.account_number,
            account_bank: req.body.account_bank
        };

        flw.Misc.verify_Account(details)
            .then(response => {
                res.status(200).json(response);
            })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.delete("/delete", async (req, res) => {
    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

        await BvnDefaultModel.deleteOne({ _id: req.body.id })
        res.status(200).json("Bvn deleted....");
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

});

router.get("/:id", verify, async (req, res) => {
    try {
        if (!req.params.id) return res.status(402).json({ msg: 'provide the id ?' })

        let user = await BvnDefaultModel.find({ _id: req.params.id })
        res.status(200).json(user);

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

module.exports = router