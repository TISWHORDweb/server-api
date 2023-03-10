const express = require('express')
const router = express.Router()
const TransferModel = require('../../../models/mongoro/transaction/api')
const MongoroUserModel = require('../../../models/mongoro/auth/mongoroUser_md')
const WebhookModel = require('../../../models/mongoro/transaction/webhook_resp_md.js')

// verify transaction from the webhook and update the database
router.post("/webhook", async (req, res) => {
    // try {
    const secretHash = process.env.FLW_SECRET_HASH;// store your secret hash as an environmental variable
    const signature = req.headers["verif-hash"];// grab the secret hash sent in the POST request header

    const tid = "00" + Math.floor(10000000000 + Math.random() * 90000000000)

    const data = {
        "response":req.body
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

    if (payload.data.status === "successful") {
        console.log("successful")
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
        
        console.log(userWallet);
        const id = userWallet._id;
        const oldAmount = userWallet.wallet_balance
        const newAmount = +oldAmount + +txAmount

        // update the user's balance on the database
        await MongoroUserModel.updateOne(
            { email: csEmail },
            { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }
        );

        // update transaction details on the database

        const details = {
            "transaction_ID": tid,
            "service_type": payload.data.payment_type,
            "amount": txAmount,
            "status": payload.data.status,
            "email": csEmail,
            "reference": txReference,
            "narration": payload.data.narration,
            "userId": id,
        }

        // save updated transaction details to the database
        let transaction = new TransferModel(details)

        await transaction.save()

        // send success response
        return res.status(201).json({
            status: true,
            message: "Deposit Successful",
        });

    }

    return res.status(401).json({
        status: true,
        message: "Transaction Failed",
    });
    // } catch (error) {
    //     return res.status(500).json({
    //         status: false,
    //         message: 'Unable to perform transaction. Please try again.',
    //         error,
    //     });
    // }
});


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