const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer');
const KycModel = require("../../../models/mongoro/kyc/kyc_md")
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")
const verify = require("../../../verifyToken")
const CryptoJS = require("crypto-js")

// let multer = require('multer')
// let fs = require('fs')
// let path = require('path');

//Configure Storage
// let storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         let __dir = path.join(__dirname, "../../../public/uploads")
//         cb(null, __dir)
//     }, filename: function (req, file, cb) {
//         let fileName = file.originalname.toLowerCase()
//         cb(null, fileName)
//     }
// })

//set Storage Configuration to multer
// let upload = multer({ storage })




//CREATE

router.post('/nin', async (req, res) => {

    const email = req.body.email
    const lastName = req.body.lastName
    const firstName = req.body.firstName
    const middleName = req.body.middleName

    const check = req.body.b_id.substr(req.body.b_id.length - 4)
    console.log(check)

    const url = "https://api.sandbox.youverify.co/v2/api/identity/ng/vnin"

    const header = {
        headers: {
            token: "PX5PKOeq.kxH0ThxPCDj2HidqDZMV0x0iw9TMXp7Z6z42"
        }
    }
    try {

        const validate = await BvnDefaultModel.findOne({ check: "MON" + check + "GORO" })

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
            } else if (checking.middleName !== middleName) {
                res.status(400).json({
                    msg: 'Credentials does not match !',
                    status: 400
                })
            }
        }

        if (validate) {
            ent()
            // let user = await MongoroUserModel.find({ email: email })
            // res.send(user)
            res.send(validate)
        } else {
            console.log("account")

            await axios.post(url, {
                "id": req.body.b_id,
                "isSubjectConsent": true
            }, header).then(resp => {
                const data = resp.data.data
                if (!data) {
                    res.status(400).json({ msg: 'Invalid BVN' })
                }
                if (data.lastName !== lastName) {
                    res.status(400).json({ msg: 'Credentials does not match ?' })
                } else if (data.firstName !== firstName) {
                    res.status(400).json({ msg: 'Credentials does not match ?' })
                } else if (data.middleName !== middleName) {
                    res.status(400).json({ msg: 'Credentials does not match ?' })
                } else {
                    console.log({ msg: "All details match " })

                    if (req.body.b_id) {
                        req.body.b_id = bcrypt.hash(req.body.b_id, 13)
                    }

                    const bodys = {
                        // "b_id": req.body.b_id,
                        "check": "MON" + check + "GORO",
                        "data": resp.data
                    }

                    let details = new BvnDefaultModel(bodys)
                    details.save()
                    res.send(details)
                    MongoroUserModel.updateOne({ email: email }, { $set: { verification: { bvn: true } } })

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


module.exports = router