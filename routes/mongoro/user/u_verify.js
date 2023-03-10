const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const CryptoJS = require("crypto-js")
const axios = require('axios')
const Flutterwave = require('flutterwave-node-v3');
const MongoroUserModel = require('../../../models/mongoro/auth/mongoroUser_md')
const BvnDefaultModel = require('../../../models/mongoro/auth/user/verification/u-verify_md')



router.post('/', async (req, res) => {

    // const email = req.body.email
    const lastName = req.body.lastName.toUpperCase();
    const firstName = req.body.firstName.toUpperCase();
    const middleName = req.body.middleName.toUpperCase();

    const bvv  = CryptoJS.AES.encrypt(req.body.b_id, "mongoro").toString()
    const userId = req.body.userId

    const check = req.body.b_id.substr(req.body.b_id.length - 4)
    console.log(check)

    const url = "https://api.sandbox.youverify.co/v2/api/identity/ng/bvn"

    const header = {
        headers: {
            token: process.env.U_VERIFY_KEY
        }
    }

    try {

        const validate = await BvnDefaultModel.findOne({ check: "MON" + check + "GORO" })

        function ent() {
            const checking = validate.data.data

            if (checking.firstName !== firstName) {
                res.status(400).json({
                    msg: 'Credentials does not match !',
                    status: 400
                })
            } else if (checking.lastName !== lastName) {
                res.status(400).json({
                    msg: 'Credentials does not match !',
                    status: 400
                })
            } else if (checking.middleName !== middleName) {
                res.status(400).json({
                    msg: 'Credentials does not match !',
                    status: 400
                })
            }
        }

        if (validate) {
            ent()
            // let user = await MongoroUserModel.find({ email: email })
            // res.send(user)
            res.status(200).json(validate)
            
        } else {
            
            await axios.post(url, {
                "id": req.body.b_id,
                "isSubjectConsent": true
            }, header).then(resp => {
                const data = resp.data.data
                console.log(data)
                if (!data) {
                    res.status(400).json({ msg: 'Invalid BVN' })
                }
                if (data.lastName !== lastName) {
                    res.status(400).json({ msg: 'Credentials does not match ?' })
                } else if (data.firstName !== firstName) {
                    res.status(400).json({ msg: 'Credentials does not match ?' })
                } else if (data.middleName !== middleName) {
                    res.status(400).json({ msg: 'Credentials does not match ?' })
                } else {
                    console.log({ msg: "All details match " })

                    const bodys = {
                        "check": "MON" + check + "GORO",
                        "data": resp.data,
                        "userId":userId
                    }

                    let details = new BvnDefaultModel(bodys)
                    details.save()
                    MongoroUserModel.updateOne({ _id: userId }, { $set: { verification: { bvn: true }, verification_number: bvv}}).then(()=>{
                        res.send(details)
                    })

                }

            })
        }
    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'There is an unknown error sorry.... Please contact our support !',
            status: 500
        })
    }
})



router.get("/banks", async (req, res) => {
    const url = "https://api.sandbox.youverify.co/v2/api/identity/ng/bank-account-number/bank-list"

    const header = {
        headers: {
            token: "PX5PKOeq.kxH0ThxPCDj2HidqDZMV0x0iw9TMXp7Z6z42"
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