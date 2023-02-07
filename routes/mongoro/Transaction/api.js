const express = require('express')
const router = express.Router()
const TransferModel = require("../../../models/mongoro/transaction/api")
const Flutterwave = require('flutterwave-node-v3');


const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

router.get('/payment-callback', async (req, res) => {
  if (req.query.status === 'successful') {
      const transactionDetails = await Transaction.find({ref: req.query.tx_ref});
      const response = await flw.Transaction.verify({id: req.query.transaction_id});
      if (
          response.data.status === "successful"
          && response.data.amount === transactionDetails.amount
          && response.data.currency === "NGN") {
          console.log("succcessful transaction")
      } else {
          console.log("errpr");
      }
  }
});

module.exports = router