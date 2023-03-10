const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const CryptoJS = require("crypto-js")
const axios = require('axios')
const TransferModel = require("../../../models/mongoro/transaction/api")
const MongoroUserModel = require('../../../models/mongoro/auth/mongoroUser_md')

router.post('/create', async (req, res) => {

    const userId = req.body.userId

    let details = await MongoroUserModel.findOne({ _id: userId })
    const verify = details.verification.bvn

    const bytes = CryptoJS.AES.decrypt(details.verification_number, process.env.SECRET_KEY);
    const b_id = bytes.toString(CryptoJS.enc.Utf8);

    if (details.account_created === true) return res.status(404).json({ msg: 'Sorry..... You can only create account once ', status: 404 })

    try {
        if (verify === true) {

            var body = JSON.stringify({
                "email": details.email,
                "is_permanent": true,
                "bvn": b_id,
                "phonenumber": details.phone,
                "firstname": details.first_name,
                "lastname": details.surname,
                "narration": details.first_name+" "+details.surname

            });

            var config = {
                method: 'post',
                url: 'https://api.flutterwave.com/v3/virtual-account-numbers',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
                },

                data: body
            };

            await axios(config)
                .then(function (response) {
                    console.log(JSON.stringify(response.data));
                    const account = response.data.data
                    MongoroUserModel.updateOne({ _id: userId }, { $set: { account: account ,  account_created: true} }).then(async () => {

                        return res.status(200).json({
                            msg: 'Account created',
                            account,
                            status: 200
                        })
                    })
                })

                .catch(function (error) {
                    res.status(400).json(error);
                });
        } else {
            res.status(402).json({
                msg: 'Your bvn is not verified',
                status: 402
            })
        }

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

module.exports = router

