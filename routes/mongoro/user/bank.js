const express = require('express')
const router = express.Router()
const BankModel = require("../../../models/mongoro/auth/user/bank/banl_md")


///Bank
router.post('/', async (req, res) => {
    try {
        if (!req.body.real_bank_account_number || !req.body.userId || !req.body.real_bank_name) return res.status(400).json({ msg: 'provide the details ?', status: 402 })

        let bank = new BankModel(req.body)
        bank.save().then(() => {
            return res.status(200).json({
                msg: 'Bank added Successful ',
                status: 200
            })
        })
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.get('/user', async (req, res) => {
    try {
        if (!req.body.userId) return res.status(400).json({ msg: 'provide the details ?', status: 402 })

        let bank = await BankModel.find({ userId: req.body.userId })
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

        await BankModel.deleteOne({ id: req.body.id })
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