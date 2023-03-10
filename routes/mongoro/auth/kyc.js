const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer');
const KycModel = require("../../../models/mongoro/kyc/kyc_md")
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")
const verify = require("../../../verifyToken")
const bcrypt = require('bcryptjs')
const axios = require("axios")


//NIN
router.post('/nin', async (req, res) => {

    const id = req.body.userId
    const lastName = req.body.lastName
    const firstName = req.body.firstName

    const check = req.body.auth_id.substr(req.body.auth_id.length - 5)
    console.log(check)

    const url = "https://api.sandbox.youverify.co/v2/api/identity/ng/vnin"

    const header = {
        headers: {
            token: process.env.U_VERIFY_KEY
        }
    }
    try {

        const validate = await KycModel.findOne({ check: "MON" + check + "GORO" })

        function ent() {
            const checking = validate.data.data

            if (checking.firstName !== firstName) {
                res.status(400).json({
                    msg: 'Credentials does not match !',
                    status: 400
                })
            } else if (checking.lastName !== lastName) {
                res.status(400).json({
                    msg: 'Credentials does not match !',
                    status: 400
                })
            } 
        }

        if (validate) {
            ent()

            res.send({verified:"Verified before",validate})
        } else {
            console.log("account")

            await axios.post(url, {
                "id":req.body.auth_id,
                "isSubjectConsent": true,
                "validations": {
                    "data": {
                        "lastName": req.body.lastName,
                        "firstName": req.body.firstName
                    }
                }
            }, header).then(resp => {
                const data = resp.data.data
                if (!data) {
                    res.status(400).json({ msg: `Invalid ${req.body.type}` })
                }
                if (data.lastName !== lastName) {
                    res.status(400).json({ msg: 'Credentials does not match ?' })
                } else if (data.firstName !== firstName) {
                    res.status(400).json({ msg: 'Credentials does not match ?' })
                } else {
                    console.log({ msg: "All details match " })

                    const bodys = {
                        "auth_id": bcrypt.hash(req.body.auth_id, 13),
                        "type":req.body.type,
                        "userId":req.body.userId,
                        "check": "MON" + check + "GORO",
                        "data": resp.data,
                        "image": req.body.image,
                        "expire_at": req.body.expire_at
                    }

                    let details = new KycModel(bodys)
                    details.save()
                    res.send(details)
                    // MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { verification: { kyc: true } } })

                }

            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'There is an unknown error sorry.... Please contact our support !',
            status: 500
        })
    }
})


//PASSPORT
router.post('/passport', async (req, res) => {

    const id = req.body.userId
    const lastName = req.body.lastName
    const firstName = req.body.firstName

    const check = req.body.auth_id.substr(req.body.auth_id.length - 5)
    console.log(check)

    const url = "https://api.sandbox.youverify.co/v2/api/identity/ng/passport"

    const header = {
        headers: {
            token: process.env.U_VERIFY_KEY
        }
    }
    try {

        const validate = await KycModel.findOne({ check: "MON" + check + "GORO" })

        function ent() {
            const checking = validate.data.data

            if (checking.firstName !== firstName) {
                res.status(400).json({
                    msg: 'Credentials does not match !',
                    status: 400
                })
            } else if (checking.lastName !== lastName) {
                res.status(400).json({
                    msg: 'Credentials does not match !',
                    status: 400
                })
            } 
        }

        if (validate) {
            ent()

            res.send({verified:"Verified before",validate})
        } else {
            console.log("account")

            await axios.post(url, {
                "id": req.body.auth_id,
                "lastName": req.body.lastName,
                "isSubjectConsent": true,
                "validations": {
                    "data": {
                        "firstName": req.body.firstName
                    }
                }
            }, header).then(resp => {
                const data = resp.data.data
                if (!data) {
                    res.status(400).json({ msg: `Invalid ${req.body.type}` })
                }
                if (data.lastName !== lastName) {
                    res.status(400).json({ msg: 'Credentials does not match ?' })
                } else if (data.firstName !== firstName) {
                    res.status(400).json({ msg: 'Credentials does not match ?' })
                } else {
                    console.log({ msg: "All details match " })

                    const bodys = {
                        "auth_id": bcrypt.hash(req.body.auth_id, 13),_id,
                        "type":req.body.type,
                        "userId":req.body.userId,
                        "check": "MON" + check + "GORO",
                        "data": resp.data,
                        "image": req.body.image,
                        "expire_at": req.body.expire_at
                    }

                    let details = new KycModel(bodys)
                    details.save()
                    res.send(details)
                    // MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { verification: { kyc: true } } })

                }

            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'There is an unknown error sorry.... Please contact our support ',
            status: 500
        })
    }
})


//DRIVER LICENSE
router.post('/driver_license', async (req, res) => {

    const id = req.body.userId
    const lastName = req.body.lastName
    const firstName = req.body.firstName

    const check = req.body.auth_id.substr(req.body.auth_id.length - 5)
    console.log(check)

    const url = "https://api.sandbox.youverify.co/v2/api/identity/ng/drivers-license"

    const header = {
        headers: {
            token: process.env.U_VERIFY_KEY
        }
    }
    try {

        const validate = await KycModel.findOne({ check: "MON" + check + "GORO" })

        function ent() {
            const checking = validate.data.data

            if (checking.firstName !== firstName) {
                res.status(400).json({
                    msg: 'Credentials does not match !',
                    status: 400
                })
            } else if (checking.lastName !== lastName) {
                res.status(400).json({
                    msg: 'Credentials does not match !',
                    status: 400
                })
            } 
        }

        if (validate) {
            ent()

            res.send({verified:"Verified before",validate})
        } else {
            console.log("account")

            await axios.post(url, {
                "id": req.body.auth_id,
                "isSubjectConsent": true,
                "validations": {
                    "data": {
                        "lastName": req.body.lastName,
                        "firstName": req.body.firstName,
                    }
                }
            }, header).then(resp => {
                const data = resp.data.data
                if (!data) {
                    res.status(400).json({ msg: `Invalid ${req.body.type}` })
                }
                if (data.lastName !== lastName) {
                    res.status(400).json({ msg: 'Credentials does not match ?' })
                } else if (data.firstName !== firstName) {
                    res.status(400).json({ msg: 'Credentials does not match ?' })
                } else {
                    console.log({ msg: "All details match " })

                    const bodys = {
                        "auth_id": bcrypt.hash(req.body.auth_id, 13),
                        "type":req.body.type,
                        "userId":req.body.userId,
                        "check": "MON" + check + "GORO",
                        "data": resp.data,
                        "image": req.body.image,
                        "expire_at": req.body.expire_at
                    }

                    let details = new KycModel(bodys)
                    details.save()
                    res.send(details)
                    // MongoroUserModel.updateOne({ _id: req.body.userId }, { $set: { verification: { kyc: true } } })

                }

            })
        }

    } catch (error) {
        console.log(error)
        res.status(500).json({
            msg: 'There is an unknown error sorry.... Please contact our support ',
            status: 500
        })
    }
})




router.get("/all", async (req, res) => {
    try {
        const kyc = await KycModel.find();
        res.status(200).json(kyc.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})



module.exports = router