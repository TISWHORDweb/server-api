const express = require('express')
const router = express.Router()
const TransferModel = require("../../../models/mongoro/transaction/api")
const Flutterwave = require('flutterwave-node-v3');
const verify = require("../../../verifyToken")
const axios = require('axios')
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")
var request = require('request');


const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);


//Treansaction

router.post("/", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  const alph = 'abcdefghijklmnopqrstuvwxyz'
  function generateRandomLetter() {
    return alph[Math.floor(Math.random() * alph.length)]
  }

  const word = generateRandomLetter()
  const words = generateRandomLetter()

  const tid = "00" + Math.floor(1000000 + Math.random() * 9000000)

  const num = "001" + Math.floor(10000 + Math.random() * 90000) + word + words

  const body = {
    "account_bank": req.body.account_bank,
    "account_number": req.body.account_number,
    "amount": req.body.amount,
    "narration": req.body.narration,
    "currency": req.body.currency,
    "reference": num,
    "callback_url": req.body.callback_url,
    "debit_currency": req.body.debit_currency
  }

  var config = {
    method: 'post',
    url: 'https://api.flutterwave.com/v3/transfers',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer FLWSECK_TEST-141328841fb7943a7b8d1788f0377d3c-X'
    },
    data: body
  };
  const user = await MongoroUserModel.find({ _id: req.body.userId });


  const oldAmount = user[0].wallet_balance
  console.log(oldAmount)

  if (oldAmount < req.body.amount) {
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
          "transaction_ID": tid,
          "service_type": req.body.service_type,
          "amount": req.body.amount,
          "status": data.status,
          "full_name": data.data.full_name,
          "account_number": data.data.account_number,
          "bank_name": data.data.bank_name,
          "userId": req.body.userId,
        }

        let transaction = new TransferModel(details)

        transaction.save().then(transaction => {
          if (transaction) {
            MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }).then(() => {
              console.log("updated")
            });
          }

          return res.status(200).json({
            msg: 'Transaction successful !!!',
            transaction: transaction,
            status: 200
          })
        })
      }

    }).catch(function (error) {
      console.log(error);
    });
  }

})


router.post("/retry", async (req, res) => {

  var options = {
    'method': 'POST',
    'url': `https://api.flutterwave.com/v3/transfers/${req.body.id}/retries`,
    'headers': {
      'Authorization': 'Bearer FLWSECK_TEST-141328841fb7943a7b8d1788f0377d3c-X',
      'Content-Type': 'application/json'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    res.status(200).json(response.body)
  });

})

router.get("/banktransfers", async (req, res) => {

  var options = {
    'method': 'GET',
    'url': 'https://api.flutterwave.com/v3/transfers',
    'headers': {
      'Authorization': 'Bearer FLWSECK_TEST-141328841fb7943a7b8d1788f0377d3c-X'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    const data = JSON.parse(response.body)
    res.status(200).json(data)
  });

})

router.get("/banktransfers/:id", async (req, res) => {

  var options = {
    'method': 'GET',
    'url': `https://api.flutterwave.com/v3/transfers/${req.params.id}`,
    'headers': {
      'Authorization': 'Bearer FLWSECK_TEST-141328841fb7943a7b8d1788f0377d3c-X'
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    const data = JSON.parse(response.body)
    res.status(200).json(data);
  });

})

router.get("/verify/:id", async (req, res) => {

  const payload = { "id": req.params.id };
  const response = await flw.Transaction.verify(payload)
  res.status(200).json(response)

})


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
router.post('/wallet', verify, async (req, res) => {

  req.body.status = "Pending"

  if (!req.body.wallet_ID || !req.body.userId) return res.status(402).json({ msg: 'please check the fields ?' })


  const alph = 'abcdefghijklmnopqrstuvwxyz'
  function generateRandomLetter() {
    return alph[Math.floor(Math.random() * alph.length)]
  }

  const word = generateRandomLetter()
  const words = generateRandomLetter()

  const num = word + words + Math.floor(10000 + Math.random() * 90000)
  req.body.transaction_ID = num

  const sender = await MongoroUserModel.find({ _id: req.body.userId });
  const senderAmount = sender[0].wallet_balance
  const senderNewAmount = senderAmount - req.body.amount
  console.log(senderNewAmount)
  console.log(senderAmount)
  console.log(senderAmount > req.body.amount)

  let user = await MongoroUserModel.findOne({ wallet_ID: req.body.wallet_ID })
  const oldAmount = user.wallet_balance
  newAmount = +oldAmount + +req.body.amount

  console.log(oldAmount)
  console.log(newAmount)
  console.log(req.body.amount)

  const value = user.blocked 

  if (value === true) {
    res.status(402).json({ msg: 'you are blocked' })
  } else if (senderAmount < req.body.amount) {
    res.status(401).json({ msg: "Insufficient funds", status: 401 });
  } else if (senderAmount < 100) {
    res.status(401).json({ msg: "you dont have enough money", status: 401 });
  } else if (req.body.amount < 100) {
    res.status(401).json({ msg: "you cant send any have money lower than 100", status: 401 });
  } else {

    try {
      let transaction = await new TransferModel(req.body)

      await transaction.save().then(transaction => {
        const id = transaction._id
        console.log(id)
        if (transaction) {
          MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { wallet_balance: senderNewAmount, wallet_updated_at: Date.now() } }).then(() => {
            console.log("updated")
            TransferModel.updateOne({ _id: id}, { $set: { status: "Completed" } }).then(async () => {
            })
          });
        }

        MongoroUserModel.updateOne({ wallet_ID: req.body.wallet_ID }, { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }).then(async () => {
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


router.get("/user/:id", async (req, res) => {
  try {
    if (!req.params.id) return res.status(402).json({ msg: 'provide the id ?' })

    let transaction = await TransferModel.find({ userId: req.params.id })
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


/////WITHDRAW
router.post("/withdraw", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  const alph = 'abcdefghijklmnopqrstuvwxyz'
  function generateRandomLetter() {
    return alph[Math.floor(Math.random() * alph.length)]
  }

  const word = generateRandomLetter()
  const words = generateRandomLetter()

  const tid = "00" + Math.floor(1000000 + Math.random() * 9000000)

  const num = "001" + Math.floor(10000 + Math.random() * 90000) + word + words

  const body = {
    "account_bank": req.body.account_bank,
    "account_number": req.body.account_number,
    "amount": req.body.amount,
    "narration": req.body.narration,
    "currency": req.body.currency,
    "reference": num,
    "callback_url": req.body.callback_url,
    "debit_currency": req.body.debit_currency
  }

  var config = {
    method: 'post',
    url: 'https://api.flutterwave.com/v3/transfers',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer FLWSECK_TEST-141328841fb7943a7b8d1788f0377d3c-X'
    },
    data: body
  };
  const user = await MongoroUserModel.find({ _id: req.body.userId });

  const oldAmount = user[0].wallet_balance
  console.log(oldAmount)

  if (oldAmount < req.body.amount) {
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
          "transaction_ID": tid,
          "service_type": req.body.service_type,
          "amount": req.body.amount,
          "status": data.status,
          "full_name": data.data.full_name,
          "account_number": data.data.account_number,
          "bank_name": data.data.bank_name,
          "userId": req.body.userId,
        }

        let transaction = new TransferModel(details)

        transaction.save().then(transaction => {
          if (transaction) {
            MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }).then(() => {
              console.log("updated")
            });
          }

          return res.status(200).json({
            msg: 'Transaction successful !!!',
            transaction: transaction,
            status: 200
          })
        })
      }

    }).catch(function (error) {
      console.log(error);
    });
  }

})