const express = require('express')
const router = express.Router()
const axios = require('axios')
const TransferModel = require('../../../models/mongoro/transaction/api')
const MongoroUserModel = require('../../../models/mongoro/auth/mongoroUser_md')
const WebhookModel = require('../../../models/mongoro/transaction/webhook_resp_md.js')
const cron = require('node-cron');

// verify transaction from the webhook and update the database
router.post("/webhook", async (req, res) => {
    try {
        const secretHash = process.env.FLW_SECRET_HASH;// store your secret hash as an environmental variable
        const signature = req.headers["verif-hash"];// grab the secret hash sent in the POST request header

        const tid = Math.floor(1000000 + Math.random() * 9000000)

        const data = {
            "response": req.body
        }

        let resp = await new WebhookModel(data)

        await resp.save()

        // verify that the POST request came from Flutterwave
        if (!signature || signature !== secretHash) {
            return res.status(401).end();
        }

        const payload = req.body
        console.log(payload)
        // It's a good idea to log all received events.;
        const csEmail = payload.data.customer.email;
        const txAmount = payload.data.amount;
        const txReference = payload.data.tx_ref;
        const flwId = payload.data.id;



        // find user on the database using the email
        const userWallet = await MongoroUserModel.findOne({ email: csEmail });

        // verify that the user exists on the database
        if (!userWallet) {
            return {
                status: false,
                statusCode: 404,
                message: `User ${csEmail} doesn't exist`,
            };
        }

        ///NOT SHOOTING
        const id = userWallet._id;
        const oldAmount = userWallet.wallet_balance
        const newAmount = +oldAmount + +txAmount

        var config = {
            method: 'get',
            url: `https://api.flutterwave.com/v3/transactions/${flwId}/verify`,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
            }
        };

        await axios(config).then(function (response) {
            const data = response.data.data

            if (data.status === "successful") {
                const details = {
                    "transaction_ID": tid,
                    "service_type": "Deposit",
                    "amount": txAmount,
                    "status": data.status,
                    "email": csEmail,
                    "reference": txReference,
                    "narration": payload.data.narration,
                    "userId": id,
                    "flw_id": data.id,
                    "full_name": data.meta.originatorname,
                    "bank_name": data.meta.bankname
                }
                // save updated transaction details to the database
                let transaction = new TransferModel(details)
                transaction.save()

                // update the user's balance on the database
                MongoroUserModel.updateOne(
                    { email: csEmail },
                    { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }
                ).then(() => {

                    // send success response
                    res.status(201).json({
                        status: true,
                        message: "Deposit Successful",
                    });
                })

            } else if (data.status === "failed") {
                const details = {
                    "transaction_ID": tid,
                    "service_type": "Deposit",
                    "amount": txAmount,
                    "status": data.status,
                    "email": csEmail,
                    "reference": txReference,
                    "narration": payload.data.narration,
                    "userId": id,
                    "flw_id": data.id,
                    "full_name": data.meta.originatorname,
                    "bank_name": data.meta.bankname
                }

                // save updated transaction details to the database
                let transaction = new TransferModel(details)
                transaction.save().then(() => {

                    // send success response
                    res.status(401).json({
                        status: true,
                        message: "Transaction failed",
                    });
                })

            } else if (data.status === "pending") {

                var task = cron.schedule('* * * * *', () => {
                    axios(config).then(function (response) {
                        const data = response.data

                        if (data.data.status  === "successful") {
                            const details = {
                                "transaction_ID": tid,
                                "service_type": "Deposit",
                                "amount": txAmount,
                                "status": data.status,
                                "email": csEmail,
                                "reference": txReference,
                                "narration": payload.data.narration,
                                "userId": id,
                                "flw_id": data.id,
                                "full_name": data.meta.originatorname,
                                "bank_name": data.meta.bankname
                            }

                            // save updated transaction details to the database
                            let transaction = new TransferModel(details)
                            transaction.save()

                            // update the user's balance on the database
                            MongoroUserModel.updateOne(
                                { email: csEmail },
                                { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }
                            ).then(() => {

                                // send success response
                                res.status(201).json({
                                    status: true,
                                    message: "Deposit Successful",
                                });
                            })
                            console.log("successful")
                            task.stop();

                        } else if (data.data.status === "failed") {
                            const details = {
                                "transaction_ID": tid,
                                "service_type": "Deposit",
                                "amount": txAmount,
                                "status": data.status,
                                "email": csEmail,
                                "reference": txReference,
                                "narration": payload.data.narration,
                                "userId": id,
                                "flw_id": data.id,
                                "full_name": data.meta.originatorname,
                                "bank_name": data.meta.bankname
                            }

                            // save updated transaction details to the database
                            let transaction = new TransferModel(details)
                            transaction.save().then(() => {

                                // send success response
                                res.status(401).json({
                                    status: true,
                                    message: "Transaction failed",
                                });
                            })

                            console.log("failed")
                            task.stop();
                        }
                    })
                    console.log("pending")

                });

                task.start();
            }
        })

    } catch (error) {
        res.send({
            status: false,
            message: 'Unable to perform transaction. Please try again.',
            error,
        });
    }
});

// function trying(){
//     const value = 5
//     var task = cron.schedule('* * * * *', () =>  {
//         console.log('will execute every minute until stopped');
//     });

//     if(value === 5){
//         task.stop();

//     }else{
//         task.start();
//     }

// }

// trying()

router.get('/webhook/all', paginatedResults(WebhookModel), (req, res) => {
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
            const results = await model.find().limit(limit).skip(startIndex).exec()
            let count = await WebhookModel.count()
            res.paginatedResults = { action, results, TotalResult: count, Totalpages: Math.ceil(count / limit) }
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}


module.exports = router
function checkDetails() {
    var config = {
        method: 'get',
        url: `https://api.flutterwave.com/v3/transactions/869781344/verify`,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
        }
    };

    axios(config).then(function (response) {
        const data = response.data.data
        console.log(data)
    })
}

var task = cron.schedule('* * * * *', () => {
    console.log('will execute every minute until stopped');
});

//   task.start();
task.stop();



////ONLY SUCCESS
//   router.post("/webhook", async (req, res) => {
//     try {
//     const secretHash = process.env.FLW_SECRET_HASH;// store your secret hash as an environmental variable
//     const signature = req.headers["verif-hash"];// grab the secret hash sent in the POST request header

//     const tid = "00" + Math.floor(10000000000 + Math.random() * 90000000000)

//     const data = {
//         "response": req.body
//     }

//     let resp = await new WebhookModel(data)

//     await resp.save()

//     // verify that the POST request came from Flutterwave
//     if (!signature || signature !== secretHash) {
//         return res.status(401).end();
//     }

//     const payload = req.body
//     console.log(payload)
//     // It's a good idea to log all received events.;
//     const csEmail = payload.data.customer.email;
//     const txAmount = payload.data.amount;
//     const txReference = payload.data.tx_ref;
//     const flwId = payload.data.id;

//     if (payload.data.status === "successful") {

//         // find user on the database using the email
//         const userWallet = await MongoroUserModel.findOne({ email: csEmail });

//         // verify that the user exists on the database
//         if (!userWallet) {
//             return {
//                 status: false,
//                 statusCode: 404,
//                 message: `User ${csEmail} doesn't exist`,
//             };
//         }

//         ///NOT SHOOTING
//         const id = userWallet._id;
//         const oldAmount = userWallet.wallet_balance
//         const newAmount = +oldAmount + +txAmount

//         var config = {
//             method: 'get',
//             url: `https://api.flutterwave.com/v3/transactions/${flwId}/verify`,
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
//             }
//         };

//         await axios(config).then(function (response) {
//             const data = response.data.data

//             const details = {
//                 "transaction_ID": tid,
//                 "service_type": payload.data.payment_type,
//                 "amount": txAmount,
//                 "status": data.status,
//                 "email": csEmail,
//                 "reference": txReference,
//                 "narration": payload.data.narration,
//                 "userId": id,
//                 "flw_id": data.id,
//                 "full_name": data.meta.originatorname,
//                 "bank_name": data.meta.bankname
//             }

//             // save updated transaction details to the database
//             let transaction = new TransferModel(details)
//             transaction.save()

//             // send success response
//             res.status(201).json({
//                 status: true,
//                 message: "Deposit Successful",
//             });

//         })

//         // update the user's balance on the database
//         await MongoroUserModel.updateOne(
//             { email: csEmail },
//             { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }
//         );

//     }

//     } catch (error) {
//         res.send({
//             status: false,
//             message: 'Unable to perform transaction. Please try again.',
//             error,
//         });
//     }
// });