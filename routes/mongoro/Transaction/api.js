const express = require('express')
const router = express.Router()
const TransferModel = require("../../../models/mongoro/transaction/api")
const Flutterwave = require('flutterwave-node-v3');

const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);

////TRANSFER      /////////////////////////////////////////////////////////////////////////////////
router.post('/transfer', async (req, res) => {

  try {
    const payload = {
      "account_bank": req.body.account_bank,
      "account_number": req.body.account_number,
      "amount": req.body.amount,
      "narration": req.body.narration,
      "currency": req.body.currency,
      "reference": "transfer-" + Date.now(),
      "callback_url": req.body.callback_url,
      "debit_currency": req.body.debit_currency
    }

    const response = await flw.Transfer.initiate(payload)

    return res.status(200).json({
      response: response,
      status: 200
    })
  } catch (error) {
    res.status(500).json({
      msg: 'there is an unknown error sorry !',
      status: 500
    })
  }

})

router.get('/transfer_fee', async (req, res) => {

  try {
    const payload = {
      "amount": req.body.amount,
      "currency": req.body.currency
    }

    const response = await flw.Transfer.fee(payload)

    return res.status(200).json({
      response: response,
      status: 200
    })
  } catch (error) {
    res.status(500).json({
      msg: 'there is an unknown error sorry !',
      status: 500
    })
  }

})

router.get('/get_transfer', async (req, res) => {

  try {
    const payload = {
      "status": req.body.status,
    }

    const response = await flw.Transfer.fetch(payload)

    return res.status(200).json({
      response: response,
      status: 200
    })
  } catch (error) {
    res.status(500).json({
      msg: 'there is an unknown error sorry !',
      status: 500
    })
  }

})


router.get('/get_single_transfer', async (req, res) => {

  try {
    const payload = {
      "id": req.body.id
    }

    const response = await flw.Transfer.get_a_transfer(payload)

    return res.status(200).json({
      response: response,
      status: 200
    })
  } catch (error) {
    res.status(500).json({
      msg: 'there is an unknown error sorry !',
      status: 500
    })
  }

})

router.post('/wallet_to_wallet', async (req, res) => {

  try {

    const payload = {
      "account_bank": req.body.account_bank,
      "merchant_id": req.body.merchant_id,
      "amount": req.body.amount,
      "narration": req.body.narration,
      "currency": req.body.currency,
      "reference": "wallet-transfer" + Date.now(),
      "debit_currency": req.body.debit_currency
    }

    const response = await flw.Transfer.wallet_to_wallet(payload)

    return res.status(200).json({
      response: response,
      status: 200
    })
  } catch (error) {
    res.status(500).json({
      msg: 'there is an unknown error sorry !',
      status: 500
    })
  }

})



////CARD///////////////////////////////////////////////////////////////////////////////////

router.post('/card', async (req, res) => {

  try {

    // Initiating the transaction
    const payload = {
      "card_number": req.body.card_number,
      "cvv": req.body.cvv,
      "expiry_month": req.body.expiry_month,
      "expiry_year": req.body.expiry_year,
      "currency": req.body.currency,
      "amount": req.body.amount,
      "redirect_url": req.body.redirect_url,
      "fullname": req.body.fullname,
      "email": req.body.email,
      "phone_number": req.body.phone_number,
      "enckey": process.env.FLW_ENCRYPTION_KEY,
      "tx_ref": req.body.tx_ref,
    }

    const response = await flw.Charge.card(payload)
    console.log(response)

    // Authorizing transactions

    // For PIN transactions
    if (response.meta.authorization.mode === 'pin') {
      let payload2 = payload
      payload2.authorization = {
        "mode": "pin",
        "fields": [
          "pin"
        ],
        "pin": 3310
      }
      const reCallCharge = await flw.Charge.card(payload2)

      // Add the OTP to authorize the transaction
      const callValidate = await flw.Charge.validate({
        "otp": "12345",
        "flw_ref": reCallCharge.data.flw_ref
      })
      console.log(callValidate)

    }
    // For 3DS or VBV transactions, redirect users to their issue to authorize the transaction
    if (response.meta.authorization.mode === 'redirect') {

      var url = response.meta.authorization.redirect
      open(url)
    }

    console.log(response)

    return res.status(200).json({
      response: response,
      status: 200
    })
  } catch (error) {
    res.status(500).json({
      msg: 'there is an unknown error sorry !',
      status: 500
    })
  }

})

router.post('/bank_transfer', async (req, res) => {

  try {

    const payload = {
      "tx_ref": req.body.tx_ref,
      "amount": req.body.amount,
      "email": req.body.email,
      "currency": req.body.currency,
     "subaccounts": [
      {
        "id": req.body.id
      }
    ]
    }

    const response = await flw.Charge.bank_transfer(payload)

    return res.status(200).json({
      response: response,
      status: 200
    })
  } catch (error) {
    res.status(500).json({
      msg: 'there is an unknown error sorry !',
      status: 500
    })
  }

})


router.post('/charge_ng', async (req, res) => {

  try {

    const payload = { 
    "tx_ref": req.body.tx_ref,
    "amount": req.body.amount,
    "account_bank": req.body.account_bank,
    "account_number": req.body.account_number,
    "currency": req.body.currency,
    "email": req.body.email,
    "phone_number": req.body.phone_number, 
    "fullname": req.body.fullname
    }

    const response = await flw.Charge.ng(payload)

    return res.status(200).json({
      response: response,
      status: 200
    })
  } catch (error) {
    res.status(500).json({
      msg: 'there is an unknown error sorry !',
      status: 500
    })
  }

})



module.exports = router