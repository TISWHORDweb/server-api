const express = require('express')
const router = express.Router()
const LoginActivityModel = require("../../../models/mongoro/auth/user/loginActivity/loginActivity")
const address = require('address');

///Bank
router.post('/', async (req, res) => {
    try {
        if (!req.body.device || !req.body.userId ) return res.status(400).json({ msg: 'provide the details ?', status: 402 })

        if(req.body.ip){
            req.body.ip=address.ip();
        }

        let activity = new LoginActivityModel(req.body)
        activity.save().then(() => {
            return res.status(200).json({
                msg: 'Device added Successful ',
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

router.get('/user/:id', async (req, res) => {
    try {
        if (!req.params.id) return res.status(400).json({ msg: 'provide the details ?', status: 400 })

        let activity = await LoginActivityModel.find({ userId: req.params.id })
        if (activity) {
            return res.status(200).json({
                activity: activity?.reverse(),
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

        await LoginActivityModel.deleteOne({ _id: req.body.id })
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