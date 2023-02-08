const express = require('express')
const router = express.Router()
const TransferModel = require("../../../models/mongoro/transaction/api")
const Flutterwave = require('flutterwave-node-v3');
const verify = require("../../../verifyToken")
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")


// const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);


//Treansaction


router.get('/all', verify, paginatedResults(TransferModel), (req, res) => {
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
      let count = await TransferModel.count()
      res.paginatedResults = { action, results, TotalResult: count, Totalpages: Math.ceil(count / limit) }
      next()
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}


//CREATE
router.post('/', verify, async (req, res) => {

  if (!req.body.transaction_ID || !req.body.userID) return res.status(402).json({ msg: 'please check the fields ?' })

  let user = await MongoroUserModel.findOne({ _id: req.body.userID })
  const oldAmount = user.wallet.balance
  newAmount = +oldAmount + +req.body.amount

  const value = user.blocked

  if (value === true) {
    res.status(402).json({ msg: 'you are blocked' })
  } else {
    try {
      let transaction = await new TransferModel(req.body)
  
      await transaction.save().then(transaction => {
  
        MongoroUserModel.updateOne({ _id: req.body.userID }, { $set: { wallet: { balance: newAmount, updated_at: Date.now() } } }).then(async () => {
        })
        return res.status(200).json({
          msg: 'Transaction successful !!!',
          transaction: transaction,
          status: 200
        })
      })
    } catch (error) {
      res.status(500).json({
        msg: 'there is an unknown error sorry !',
        status: 500
      })
    }
  }


})

router.delete("/delete", verify, async (req, res) => {
  try {
    if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

    await TransferModel.deleteOne({ _id: req.body.id })
    res.status(200).json("Transaction deleted....");
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

    let transaction = await TransferModel.find({ _id: req.params.id })
    res.status(200).json(transaction);
  } catch (err) {
    res.status(500).json({
      msg: 'there is an unknown error sorry !',
      status: 500
    })
  }
})






module.exports = router



// router.get('/payment-callback', async (req, res) => {
//   if (req.query.status === 'successful') {
//       const transactionDetails = await Transaction.find({ref: req.query.tx_ref});
//       const response = await flw.Transaction.verify({id: req.query.transaction_id});
//       if (
//           response.data.status === "successful"
//           && response.data.amount === transactionDetails.amount
//           && response.data.currency === "NGN") {
//           console.log("succcessful transaction")
//       } else {
//           console.log("errpr");
//       }
//   }
// });

module.exports = router