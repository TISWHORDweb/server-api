const express = require('express')
const router = express.Router()
const WithdrawModel = require("../../../models/mongoro/transaction/withdraw")
const Flutterwave = require('flutterwave-node-v3');
const verify = require("../../../verifyToken")
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")


// const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);


//Treansaction


router.get('/all', verify, paginatedResults(WithdrawModel), (req, res) => {
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
      let count = await WithdrawModel.count()
      res.paginatedResults = { action, results, TotalResult: count, Totalpages: Math.ceil(count / limit) }
      next()
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }
}


//CREATE
router.post('/', async (req, res) => {

    if (!req.body.status || !req.body.amount) return res.status(402).json({ msg: 'please check the fields ?' })
  
    let user = await MongoroUserModel.findOne({ wallet_ID: req.body.wallet_ID})
    const oldAmount = user.wallet_balance
    newAmount = oldAmount - req.body.amount

    const value = user.blocked
  
    if (value === true) {
      res.status(402).json({ msg: 'you are blocked' })
    } else {
      try {
        let transaction = await new WithdrawModel(req.body)
    
        await transaction.save().then(transaction => {
    
          MongoroUserModel.updateOne({ wallet_ID: req.body.wallet_ID}, { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }).then(async () => {
          })
          return res.status(200).json({
            msg: 'Withdraw successful !!!',
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


module.exports = router