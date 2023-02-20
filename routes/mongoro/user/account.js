const express = require('express')
const router = express.Router()
const verify = require("../../../verifyToken")
const bcrypt = require('bcryptjs')
const axios = require('axios')
const TransferModel = require("../../../models/mongoro/transaction/api")
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

    let details = await MongoroUserModel.findOne({ email: email })
    const verify = details.verification.bvn

    try {
        if (verify === true) {

            var body = JSON.stringify({
                "email": email,
                "is_permanent": true,
                "bvn": req.body.bvn,
                "phonenumber": req.body.phonenumber,
                "firstname": req.body.firstname,
                "lastname": req.body.lastname,
                "narration": req.body.narration
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

            await axios(config)
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

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

// /////ACCOUNT ENT
// router.get("/statement", async (req, res) => {


//     TransferModel.find({where: {Date:{between: ['2010-01-05 10:00', '2012-05-10 10:00']}}}).then(result => {
//         res.send(result);
//     })
  
//   });

module.exports = router

router.get("/statementsofuser", async (req, res) => {
    try {
      const query = { "amount.0": { "$gte": 5000, "$lte": 200 } }
    const statement = await TransferModel.find();
  
    res.status(200).json(statement);
  
  
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorrys !',
            status: 500
        })
    }
  })