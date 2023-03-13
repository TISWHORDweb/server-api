const express = require('express')
const router = express.Router()
const BankModel = require("../../../models/mongoro/auth/user/bank/banl_md")
const Flutterwave = require('flutterwave-node-v3');
const flw = new Flutterwave(process.env.FLW_PUBLIC_KEY, process.env.FLW_SECRET_KEY);


///Bank
router.post('/', async (req, res) => {
    try {
        if (!req.body.real_bank_account_number || !req.body.real_bank_code || !req.body.userId || !req.body.real_bank_name) return res.status(400).json({ msg: 'provide the details ?', status: 402 })

        const details = {
            account_number: req.body.real_bank_account_number,
            account_bank: req.body.real_bank_code
        };

        flw.Misc.verify_Account(details).then(response => {

            if (response) {
                const body = {
                    userId: req.body.userId,
                    real_bank_account_number: req.body.real_bank_account_number,
                    real_bank_name: req.body.real_bank_name,
                    real_bank_code: req.body.real_bank_code,
                    account_name: response.data.account_name
                }

                let bank = new BankModel(body)
                bank.save().then(() => {
                    return res.status(200).json({
                        msg: 'Bank added Successful ',
                        bank,
                        status: 200
                    })
                })
            }

        }).catch((error) => {
            res.status(400).json({
                msg: 'Invalid account number or bank name, Check and retry',
                status: 400
            })

        })
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.get('/user/:id', async (req, res) => {
    try {
        if (!req.params.id) return res.status(400).json({ msg: 'provide the details ?', status: 400 })

        let bank = await BankModel.find({ userId: req.params.id })
        if (bank) {
            return res.status(200).json({
                bank: bank,
                status: 200
            })
        } else {
            return res.status(400).json({ msg: 'User not found' })
        }
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.delete('/delete', async (req, res) => {
    try {
        if (!req.body.id) return res.status(400).json({ msg: 'provide the details ?', status: 402 })

        await BankModel.deleteOne({ _id: req.body.id })
        return res.status(200).json({
            msg: "Deleted successfully",
            status: 200
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})


module.exports = router