const express = require('express')
const router = express.Router()
const WithdrawModel = require("../../../models/mongoro/transaction/withdraw")
const verify = require("../../../verifyToken")
const axios = require('axios')
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")
var request = require('request');
const CryptoJS = require("crypto-js")
const GlobalModel = require('../../../models/mongoro/admin/super_admin/global/global_md')


/////WITHDRAW
router.post("/", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    const tid = "00" + Math.floor(1000000 + Math.random() * 9000000)

    const users = await MongoroUserModel.find({ _id: req.body.userId });
    const bytes = CryptoJS.AES.decrypt(users[0].pin, process.env.SECRET_KEY);
    const originalPin = bytes.toString(CryptoJS.enc.Utf8);

    const body = {
        "account_bank": req.body.account_bank,
        "account_number": req.body.account_number,
        "amount": req.body.amount,
        "narration": req.body.narration,
        "currency": req.body.currency,
        "reference": tid,
        "callback_url": req.body.callback_url,
        "debit_currency": req.body.debit_currency
    }

    var config = {
        method: 'post',
        url: 'https://api.flutterwave.com/v3/transfers',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
        },
        data: body
    };
    const user = await MongoroUserModel.find({ _id: req.body.userId });

    const oldAmount = user[0].wallet_balance
    console.log(oldAmount)

    const userss = await GlobalModel.findOne({ _id: process.env.GLOBAL_ID })
    const value = userss.disable_all_transfer
    const resultt = user[0].blocked
  
    if (resultt === true) {
      res.status(403).json({ msg: "Sorry your account is blocked" })
    } else if (value === true) {
      res.status(400).json({ msg: "Sorry service temporarily unavailable", code: 400 })
    } else if (originalPin !== req.body.pin) {
        res.status(401).json({ msg: 'Wrong pin ', status: 401 })
    } else {

        if (oldAmount <= req.body.amount) {
            res.status(401).json({ msg: "Insufficient funds", status: 401 });
        } else if (oldAmount < 100) {
            res.status(401).json({ msg: "you dont have enough money", status: 401 });
        } else if (req.body.amount < 100) {
            res.status(401).json({ msg: "you cant send any have money lower than 100", status: 401 });
        } else {

            const newAmount = oldAmount - req.body.amount

            console.log(newAmount)

            await axios(config).then(function (response) {
                const data = response.data;

                if (data) {

                    const details = {
                        "flw_id": data.data.id,
                        "reference": tid,
                        "service_type": req.body.service_type,
                        "amount": req.body.amount,
                        "status": data.status,
                        "full_name": data.data.full_name,
                        "account_number": data.data.account_number,
                        "bank_name": data.data.bank_name,
                        "userId": req.body.userId,
                    }

                    let transaction = new WithdrawModel(details)

                    transaction.save().then(transaction => {
                        if (transaction) {
                            MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }).then(() => {
                                console.log("updated")
                            });
                        }

                        return res.status(200).json({
                            msg: 'Transaction successful',
                            transaction: transaction,
                            status: 200
                        })
                    })
                }

            }).catch(function (error) {
                res.status(500).json({
                    msg: 'there is an unknown error sorry ',
                    error,
                    status: 500
                })
            });
        }
    }
})


router.get('/all', paginatedResults(WithdrawModel), (req, res) => {
    res.json(res.paginatedResults)
})

function paginatedResults(model) {
    return async (req, res, next) => {
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const action = {}

        if (endIndex < await model.countDocuments().exec()) {
            action.next = {
                page: page + 1,
                limit: limit
            }
        }

        if (startIndex > 0) {
            action.previous = {
                page: page - 1,
                limit: limit
            }
        }
        try {
            const results = await model.find().sort({_id:-1}).limit(limit).skip(startIndex).exec()
            let count = await WithdrawModel.count()
            const result = results.reverse()
            res.paginatedResults = { action, result, TotalResult: count, Totalpages: Math.ceil(count / limit) }
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}


router.get("/:id", verify, async (req, res) => {
    try {
        if (!req.params.id) return res.status(402).json({ msg: 'provide the id ?' })

        let transaction = await WithdrawModel.find({ userId: req.params.id })
        res.status(200).json(transaction);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


module.exports = router   
