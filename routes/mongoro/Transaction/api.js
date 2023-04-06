const express = require('express')
const router = express.Router()
const TransferModel = require("../../../models/mongoro/transaction/api")
const Flutterwave = require('flutterwave-node-v3');
const verify = require("../../../verifyToken")
const axios = require('axios')
const TierModel = require('../../../models/mongoro/transaction/tier_md')
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")
const GlobalModel = require('../../../models/mongoro/admin/super_admin/global/global_md')
const CryptoJS = require("crypto-js")
var request = require('request');
const cron = require('node-cron');
// const responses = require('./response');

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

router.get("/insight/:id", async (req, res) => {
  try {
    const lastTransaction = await TransferModel.find({ userId: req.params.id, service_type: "Transfer", status: "successful" }).limit(1).sort({$natural:-1})
    const lastDeposit = await TransferModel.find({ userId: req.params.id, service_type: "Deposit", status: "successful" }).limit(1).sort({$natural:-1})

    return res.status(200).json({
      msg: 'User insight',
      data:{lastDeposit,lastTransaction},
      status: 200
    })
  } catch (err) {
    res.status(500).json({
      msg: 'there is an unknown error sorry ',
      status: 500
    })
  }
})


router.get("/tier/all", async (req, res) => {
  try {
    const tier = await TierModel.find();
    res.status(200).json(tier.reverse());
  } catch (err) {
    res.status(500).json({
      msg: 'there is an unknown error sorry ',
      status: 500
    })
  }
})

router.delete("/tier/delete", async (req, res) => {
  try {
    if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

    await TierModel.deleteOne({ _id: req.body.id })
    res.status(200).json({ msg: "Tier deleted....", status: 200 });
  } catch (error) {
    res.status(500).json({
      msg: 'there is an unknown error sorry !',
      status: 500
    })
  }

});


//Treansaction
router.post("/", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  req.body.amount = parseInt(req.body.amount)

  const tid = Math.floor(1000000 + Math.random() * 9000000)
  const ran = Math.floor(100000000000 + Math.random() * 900000000000)

  const body = {
    "account_bank": req.body.account_bank,
    "account_number": req.body.account_number,
    "amount": req.body.amount,
    "narration": req.body.narration,
    "currency": req.body.currency,
    "reference": `MGR-NGN-${ran}`,
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

  const user = await MongoroUserModel.findOne({ _id: req.body.userId });

  let originalPin
  let pin
  let resultt;

  if (user) {
    pin = user.pin
    resultt = user.blocked
    const bytes = CryptoJS.AES.decrypt(pin, process.env.SECRET_KEY);
    originalPin = bytes.toString(CryptoJS.enc.Utf8);
  } else {
    return res.status(400).json({ msg: 'User not found', status: 400 })
  }

  let value;

  const users = await GlobalModel.findOne({ _id: process.env.GLOBAL_ID })

  if (users) {
    value = users.disable_all_transfer
  }

  let number;
  let per;

  const allTransfer = await TierModel.findOne({ userId: req.body.userId })

  let allTotal;
  let type;

  if (allTransfer) {
    allTotal = allTransfer.amount
    type = user.tiers
  }

  if (type === "one") {
    number = 100000
    per = 20000
  }

  if (type === "two") {
    number = 1000000
    per = 100000
  }
  if (type === "three") {
    number = 10000000
    per = 1000000
  }


  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  let currentDate = `${day}-${month}-${year}`;

  let boddy = {
    date: currentDate,
    userId: req.body.userId,
    limit: number
  }

  const check = await TierModel.findOne({ userId: req.body.userId, date: currentDate })

  // try {

  if (!check) {
    let tier = new TierModel(boddy)
    tier.save()
  } else {
    if (req.body.amount > per) {
      return res.send({ msg: `You can only send ${per} at once any amount greater than that is not accepted, Upgrade your account to have access, Thanks`, status: 400 });
    } else if (allTotal > number) {
      return res.send({ msg: "You have reach your daily transaction limit, Upgrade your account to have access", status: 400})
    } else {
      const total = +req.body.amount + +allTotal

      await TierModel.updateOne({ userId: req.body.userId }, { $set: { amount: total } })

      if (resultt === true) {
        return res.status(400).json({ msg: "Sorry your account is blocked", status: 400 })
      } else if (value === true) {
        return res.status(400).json({ msg: "Sorry service temporarily unavailable", code: 400 })
      } else if (originalPin !== req.body.pin) {
        return res.status(400).json({ msg: "Wrong PIN", status: 400 });
      } else {
        const oldAmount = user.wallet_balance

        console.log(oldAmount)

        if (oldAmount < req.body.amount) {
          return res.status(400).json({ msg: "Insufficient funds", status: 404 });
        } else if (req.body.amount < 100) {
          return res.status(400).json({ msg: "You cant send any money lower than 100", status: 401 });
        } else {

          await axios(config).then(function (response) {
            const data = response.data;

            console.log(data)

            if (data) {
              const newAmount = oldAmount - data.data.amount;
              const flwId = data.data.id

              var configs = {
                method: 'get',
                url: `https://api.flutterwave.com/v3/transfers/${flwId}`,
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
                }
              };

              axios(configs).then(function (response) {
                const data = response.data
                console.log(data)

                const details = {
                  "flw_id": data.data.id,
                  "transaction_ID": tid,
                  "service_type": "Transfer",
                  "amount": req.body.amount,
                  "status": "successful",
                  "full_name": data.data.full_name,
                  "account_number": data.data.account_number,
                  "bank_name": data.data.bank_name,
                  "userId": req.body.userId,
                  "reference": data.data.reference,
                  "sender_status": "Debit"
                }

                const detail = {
                  "flw_id": data.data.id,
                  "transaction_ID": tid,
                  "service_type": "Transfer",
                  "amount": req.body.amount,
                  "status": "failed",
                  "full_name": data.data.full_name,
                  "account_number": data.data.account_number,
                  "bank_name": data.data.bank_name,
                  "userId": req.body.userId,
                  "reference": data.data.reference,
                  "sender_status": "Debit"
                }

                if (data.data.status === "SUCCESSFUL") {
                  console.log("SUCCESSFUL")

                  let transaction = new TransferModel(details)
                  transaction.save()
                  MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }).then(()=>{
                    return res.status(200).json({
                      msg: 'Transaction is Successful',
                      data,
                      status: 200
                    })
                  })
                } else if (data.data.status === "FAILED") {
                  console.log("FAILED")

                  let transaction = new TransferModel(detail)
                  transaction.save().then(() => {

                    // send failed response
                    return res.status(400).json({
                      status: 400,
                      message: "Transaction failed",
                    });
                  })
                  
                } else if (data.data.status === "PENDING") {
                  console.log("PENDING")

                  MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }).then(()=>{
                    return res.status(200).json({
                      msg: 'Transaction is progress',
                      data,
                      status: 200
                    })
                  })

                  const details = {
                    "flw_id": data.data.id,
                    "transaction_ID": tid,
                    "service_type": "Transfer",
                    "amount": req.body.amount,
                    "status": "pending",
                    "full_name": data.data.full_name,
                    "account_number": data.data.account_number,
                    "bank_name": data.data.bank_name,
                    "userId": req.body.userId,
                    "reference": data.data.reference,
                    "sender_status": "Debit"
                  }

                  let transaction = new TransferModel(details)
                  transaction.save()

                  const transId = transaction._id

                  var task = cron.schedule('* * * * *', () => {
                    axios(configs).then(function (response) {
                      const data = response.data

                      if (data.data.status === "SUCCESSFUL") {
                       
                        MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }).then(()=>{
                          TransferModel.updateOne({ _id: transId}, { $set: {status:"successful"}}).then(()=>{
                          console.log(transId)
                          console.log("successful")
                        })
                        })
                        task.stop();
                      } else if (data.data.status === "FAILED") {
                        MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { wallet_balance: oldAmount, wallet_updated_at: Date.now() } }).then(()=>{
                          TransferModel.updateOne({ _id: transId}, { $set: {status:"failed"}}).then(()=>{
                          console.log(transId)
                          console.log("failed")
                        })
                        })
                        task.stop();
                      }
                    })
                    console.log("inside")

                  });

                  task.start();

                } else if (data.data.status === "NEW") {
                  console.log("NEW")
                  
                  MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }).then(()=>{
                    return res.status(200).json({
                      msg: 'Transaction is progress',
                      data,
                      status: 200
                    })
                  })

                  const details = {
                    "flw_id": data.data.id,
                    "transaction_ID": tid,
                    "service_type": "Transfer",
                    "amount": req.body.amount,
                    "status": "pending",
                    "full_name": data.data.full_name,
                    "account_number": data.data.account_number,
                    "bank_name": data.data.bank_name,
                    "userId": req.body.userId,
                    "reference": data.data.reference,
                    "sender_status": "Debit"
                  }

                  let transaction = new TransferModel(details)
                  transaction.save()

                  const transId = transaction._id

                  var task = cron.schedule('* * * * *', () => {
                    axios(configs).then(function (response) {
                      const data = response.data
                      console.log(data)

                      if (data.data.status === "SUCCESSFUL") {
                       
                        MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }).then(()=>{
                          TransferModel.updateOne({ _id: transId}, { $set: {status:"successful"}}).then(()=>{
                          console.log(transId)
                          console.log("successful")
                        })
                        })
                        task.stop();
                      } else if (data.data.status === "FAILED") {
                        MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { wallet_balance: oldAmount, wallet_updated_at: Date.now() } }).then(()=>{
                          TransferModel.updateOne({ _id: transId}, { $set: {status:"failed"}}).then(()=>{
                          console.log(transId)
                          console.log("failed")
                        })
                        })
                        task.stop();
                      }
                    })
                    console.log("inside")

                  });

                  task.start();

                }
              })
            }
          })

        }
      }
    }
  }
  // } catch (error) {
  //   res.send({
  //     msg: 'there is an unknown error sorry ',
  //     status: 500
  //   })
  // }
})


router.post("/retry", async (req, res) => {

  var options = {
    'method': 'POST',
    'url': `https://api.flutterwave.com/v3/transfers/${req.body.id}/retries`,
    'headers': {
      'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
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
      'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
    }
  };
  request(options, function (error, response) {
    if (error) throw new Error(error);
    const data = JSON.parse(response.body)
    res.status(200).json(data)
  });

})


router.get('/all', paginatedResults(TransferModel), (req, res) => {
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

  let number;
  let per;
  let allTotal;

  req.body.amount = parseInt(req.body.amount)

  const users = await MongoroUserModel.findOne({ _id: req.body.userId });

  const type = users.tiers
  const bytes = CryptoJS.AES.decrypt(users.pin, process.env.SECRET_KEY);
  const originalPin = bytes.toString(CryptoJS.enc.Utf8);


  if (type === "one") {
    number = 100000
    per = 20000
  }
  if (type === "two") {
    number = 1000000
    per = 100000
  }
  if (type === "three") {
    number = 10000000
    per = 1000000
  }

  console.log(per)

  const date = new Date();
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();

  let currentDate = `${day}-${month}-${year}`;

  let body = {
    date: currentDate,
    userId: req.body.userId,
    limit: number
  }

  const check = await TierModel.findOne({ userId: req.body.userId, date: currentDate })

  const tid = Math.floor(1000000 + Math.random() * 9000000)
  const ran = Math.floor(100000000000 + Math.random() * 900000000000)

  if (!req.body.wallet_ID || !req.body.userId) return res.status(400).json({ msg: 'please check the fields ?' })

  const sender = await MongoroUserModel.findOne({ _id: req.body.userId });
  const senderAmount = sender.wallet_balance
  const senderFullName = sender.surname + " " + sender.first_name
  const senderNewAmount = senderAmount - req.body.amount

  let user = await MongoroUserModel.findOne({ wallet_ID: req.body.wallet_ID })
  const oldAmount = user.wallet_balance
  newAmount = +oldAmount + +req.body.amount
  const receiverFullName = user.surname + " " + user.first_name
  const value = sender.blocked
  console.log(value)

  const userss = await GlobalModel.findOne({ _id: process.env.GLOBAL_ID })
  const resultt = userss.disable_all_transfer

  if (!check) {
    let tier = new TierModel(body)
    tier.save()
    allTotal = 0
  } else {
    const allTransfer = await TierModel.findOne({ userId: req.body.userId })
    allTotal = allTransfer.amount
  }

  console.log(senderAmount)
  if (req.body.amount > per) {
    res.send({ msg: `You can only send ${per} at once any amount greater than that is not accepted, Upgrade your account to have access, Thanks`, status: 400 });
  } else if (allTotal > number) {
    res.send({ msg: "You have reach your daily transaction limit, Upgrade your account to have access" })
  } else if (value === true) {
    res.send({ msg: "Sorry your account is blocked" })
  } else if (resultt === true) {
    res.send({ msg: "Sorry service temporarily unavailable", code: 400 })
  } else if (originalPin !== req.body.pin) {
    res.send({ msg: 'Wrong pin ', status: 401 })
  } else if (senderAmount < req.body.amount) {
    res.send({ msg: "Insufficient funds", status: 400 });
  } else if (senderAmount < 100) {
    res.send({ msg: "you dont have enough money", status: 400 });
  } else if (req.body.amount < 100) {
    res.send({ msg: "you cant send any have money lower than 100", status: 400 });
  } else {

    try {

      const total = +req.body.amount + +allTotal
      await TierModel.updateOne({ userId: req.body.userId }, { $set: { amount: total } }).then(() => {
      })

      const single = await MongoroUserModel.findOne({ wallet_ID: req.body.wallet_ID })
      const receiver = single._id

      const datas = {
        "amount": req.body.amount,
        "wallet_ID": req.body.wallet_ID,
        "service_type": "Deposit",
        "userId": receiver,
        "narration": req.body.narration,
        "status_type": "Credit",
        "status": "successful",
        "transaction_ID": tid,
        "full_name": senderFullName,
        "bank_name": "Mongoro",
        "reference": `MGR_NGN_${ran}`
      }

      const body = {
        "amount": req.body.amount,
        "wallet_ID": req.body.wallet_ID,
        "service_type": "Transfer",
        "userId": req.body.userId,
        "narration": req.body.narration,
        "status_type": "Debit",
        "status": "successful",
        "transaction_ID": tid,
        "full_name": receiverFullName,
        "bank_name": "Mongoro",
        "reference": `MGR-NGN-${ran}`
      }

      let transaction = await new TransferModel(body)

      await transaction.save().then(transaction => {
        const id = transaction._id
        console.log({ "id": id })
        console.log(id)
        if (transaction) {
          MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { wallet_balance: senderNewAmount, wallet_updated_at: Date.now() } }).then(() => {
          });
        }
        res.send({
          msg: 'Transaction successful ',
          transaction: transaction,
          status: 200
        })
        MongoroUserModel.updateOne({ wallet_ID: req.body.wallet_ID }, { $set: { wallet_balance: newAmount, wallet_updated_at: Date.now() } }).then(async () => {
          let receiver = await new TransferModel(datas)
          await receiver.save()
        })

      })
    } catch (error) {

      let transaction = await new TransferModel(req.body)

      await transaction.save().then(transaction => {
        const id = transaction._id
        console.log({ "id": id })
        console.log(id)
        if (transaction) {
          TransferModel.updateOne({ _id: id }, { $set: { status: "failed" } }).then(async () => {
            let transaction = await TransferModel.findOne({ _id: id })
            return res.status(400).json({
              msg: 'Transaction Unsuccessful ',
              transaction: transaction,
              status: 400
            })
          });
        }
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



////BILLS PAYMENT
router.post("/bills", async (req, res) => {
  res.header("Access-Control-Allow-Origin", "*");

  const tid = "00" + Math.floor(1000000 + Math.random() * 9000000)

  const users = await MongoroUserModel.find({ _id: req.body.userId });
  const bytes = CryptoJS.AES.decrypt(users[0].pin, process.env.SECRET_KEY);
  const originalPin = bytes.toString(CryptoJS.enc.Utf8);

  try {
    var config = {
      'method': 'POST',
      'url': 'https://api.flutterwave.com/v3/bills',
      'headers': {
        'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`
      },
      data: {
        "country": req.body.country,
        "customer": req.body.customer,
        "amount": req.body.amount,
        "type": req.body.type,
        "reference": req.body.reference
      }

    };


    const user = await MongoroUserModel.find({ _id: req.body.userId });

    const oldAmount = user[0].wallet_balance
    console.log(oldAmount)

    const users = await GlobalModel.findOne({ _id: process.env.GLOBAL_ID })
    const value = users.disable_all_transfer
    const resultt = user[0].blocked

    if (resultt === true) {
      res.status(403).json({ msg: "Sorry your account is blocked" })
    } else if (value === true) {
      res.status(400).json({ msg: "Sorry service temporarily unavailable", code: 400 })
    } else if (originalPin !== req.body.pin) {
      res.status(401).json({ msg: 'Wrong pin ', status: 401 })
    } else if (oldAmount < req.body.amount) {
      res.status(401).json({ msg: "Insufficient funds", status: 401 });
    } else if (oldAmount < 100) {
      res.status(401).json({ msg: "you dont have enough money", status: 401 });
    } else if (req.body.amount < 100) {
      res.status(401).json({ msg: "you cant send any have money lower than 100", status: 401 });
    } else {


      const bytes = CryptoJS.AES.decrypt(user[0].pin, process.env.SECRET_KEY);
      const originalPin = bytes.toString(CryptoJS.enc.Utf8);

      const newAmount = oldAmount - req.body.amount

      console.log(newAmount)

      await axios(config).then(function (response) {
        const data = response.data;

        console.log(data)

        if (data) {
          const details = {
            "transaction_ID": tid,
            "service_type": req.body.service_type,
            "amount": req.body.amount,
            "status": data.status,
            "flw_id": data.data.id,
            "country": req.body.country,
            "customer": req.body.customer,
            "biller_name": req.body.biller_name,
            "type": req.body.type,
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
              msg: 'Transaction successful ',
              transaction: transaction,
              status: 200
            })
          })
        }

      }).catch((error) => {
        console.log(error)
        res.status(400).json({
          msg: 'check the details and reference',
          status: 400,
        })
      })

    }
  } catch (error) {
    res.status(500).json({
      msg: 'there is an unknown error sorry !',
      status: 500,
    })
  }
})


////OTP 
router.post("/otp", async (req, res) => {

  var data = JSON.stringify({
    "length": 7,
    "customer": {
      "name": "Emmanuel",
      "email": "e.batimehin@gmail.com",
      "phone": "2348120963057"
    },
    "sender": "Mongoro",
    "send": true,
    "medium": [
      "email",
      "sms"
    ],
    "expiry": 5
  });

  var config = {
    method: 'post',
    url: 'https://api.flutterwave.com/v3/otps',
    headers: {
      'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });


})


router.post("/verify_otp", async (req, res) => {

  var data = JSON.stringify({
    "otp": "481208"
  });

  var config = {
    method: 'post',
    url: `https://api.flutterwave.com/v3/otps/${req.params.reference}/validate`,
    headers: {
      'Authorization': `Bearer ${process.env.FLW_SECRET_KEY}`,
      'Content-Type': 'application/json'
    },
    data: data
  };

  axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });


})

