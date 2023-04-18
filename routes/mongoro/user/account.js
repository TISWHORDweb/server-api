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

    let verify;
    let bvn;
    let account_created

    if(details){
        verify = details.verification.bvn
        bvn = details.verification_number
        account_created = details.account_created
    }else{
        res.status(400).json({ msg: 'User not found', status: 400 })
    }

    // if (account_created === true) return res.status(400).json({ msg: 'Sorry..... You can only create account once ', status: 400 })

    try {
        if (verify === true) {

            const bytes = CryptoJS.AES.decrypt(bvn, process.env.SECRET_KEY);
            const b_id = bytes.toString(CryptoJS.enc.Utf8);

            var body = JSON.stringify({
                "email": details.email,
                "is_permanent": true,
                "bvn": b_id,
                "phonenumber": details.phone,
                "firstname": details.first_name,
                "lastname": details.surname,
                "narration": "Mongoro "+details.first_name+" "+details.surname

            });
            
            // var body = JSON.stringify({
            //     "email": req.body.email,
            //     "is_permanent": true,
            //     "bvn": req.body.bvn,
            //     "phonenumber": req.body.phone,
            //     "firstname": req.body.first_name,
            //     "lastname": req.body.surname,
            //     "narration": req.body.narration,
            //     "tx_ref": req.body.tx_ref
            // });

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
