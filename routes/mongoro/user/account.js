const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const bcrypt = require('bcryptjs')
const axios = require('axios')
const MongoroUserModel = require('../../../models/mongoro/auth/mongoroUser_md')

router.post('/create', async (req, res) => {
    // const alph = 'abcdefghijklmnopqrstuvwxyz'
    // function generateRandomLetter() {
    //     return alph[Math.floor(Math.random() * alph.length)]
    // }

    // const word = generateRandomLetter()
    // const words = generateRandomLetter()

    // const num = Math.floor(100 + Math.random() * 900)

    const email = req.body.email
    // const phone = req.body.phone

    let details = await MongoroUserModel.findOne({ email: email })
    const verify = details.verification.bvn

    try {
        if (verify === true) {

            // const body =  JSON.stringify({
            //     "email": email,
            //     "is_permanent": true,
            //     "bvn": bvn,
            //     "tx_ref": word + words + num,
            //     "phonenumber": phone,
            //     "firstname": firstName,
            //     "lastname": lastName
            // })

            var body = JSON.stringify({
                "email": "developers@flutterwavego.com",
                "is_permanent": true,
                "bvn": "12345678901",
                "tx_ref": "VA12",
                "phonenumber": "08109328188",
                "firstname": "Angela",
                "lastname": "Ashley",
                "narration": "Angela Ashley-Osuzoka"
            });

            var config = {
                method: 'post',
                url: 'https://api.flutterwave.com/v3/virtual-account-numbers',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer FLWSECK_TEST-141328841fb7943a7b8d1788f0377d3c-X'
                },
                data: body
            };

            axios(config)
                .then(function (response) {
                    console.log(JSON.stringify(response.data));
                    const acc = response.data
                    MongoroUserModel.updateOne({ email: email }, { $set: { account: acc, verification: { bvn: true } } }).then(async () => {

                        return res.status(200).json({
                            msg: 'Details saved!!!',
                            account: acc,
                            status: 200
                        })
                    })

                })
                .catch(function (error) {
                    console.log(error);
                });
        } else {
            res.status(402).json({
                msg: 'Your bvn is not verified',
                status: 402
            })
        }
        // if (!req.body.userId) return res.status(402).json({ msg: 'provide the id ?' })

        // let details = await new AccountModel(req.body)

        // await details.save().then(details => {
        //     return res.status(200).json({
        //         msg: 'Details saved!!!',
        //         details: details,
        //         status: 200
        //     })
        // })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


module.exports = router