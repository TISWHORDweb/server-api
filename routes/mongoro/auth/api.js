const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer');
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")
const CryptoJS = require("crypto-js")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()
const verify = require("../../../verifyToken")
const address = require('address');
const Word = require('../../words')
const request = require('request');
const bcrypt = require('bcryptjs')
const GlobalModel = require('../../../models/mongoro/admin/super_admin/global/global_md')
const platform = require('platform');


//CREATE
router.post('/register', async (req, res) => {

    req.body.first_name.toLowerCase()
    req.body.surname.toLowerCase()
    req.body.middle_name.toLowerCase()
    req.body.usertag.toLowerCase()

    const ref = "@" + req.body.usertag

    req.body.wallet_ID = ref
    console.log(req.body.wallet_ID)

    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 13)
    }

    try {
        if (!req.body.email || !req.body.usertag || !req.body.surname || !req.body.first_name || !req.body.password || !req.body.phone) return res.status(402).json({ msg: 'please check the fields ?', status: 402 })

        const validate = await MongoroUserModel.findOne({ wallet_ID: req.body.wallet_ID })
        if (validate) return res.status(404).json({ msg: 'There is another user with this User Tag ', status: 404 })

        const validates = await MongoroUserModel.findOne({ email: req.body.email })
        if (validates) return res.status(404).json({ msg: 'There is another user with this email ', status: 404 })


        let user = await new MongoroUserModel(req.body)

        await user.save().then(user => {

            const accessToken = jwt.sign(
                { id: user._id },
                process.env.SECRET_KEY,
                { expiresIn: "5h" }

            );
            return res.status(200).json({
                msg: 'Congratulation you just Created your Mongoro Account ',
                user: user,
                token: accessToken,
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

router.put("/verified", async (req, res) => {
    try {

        await MongoroUserModel.updateOne({ email: req.body.email }, { $set: { isverified: true } })

        return res.status(200).json({
            msg: 'Congratulation your Account is verified',
            status: 200
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.post("/verify", async (req, res) => {
    try {
        email_code = Math.floor(100 + Math.random() * 900)
        sms_code = Math.floor(100 + Math.random() * 900)

        let code = { email_code, sms_code }

        let transporter = nodemailer.createTransport({
            service: "hotmail",
            auth: {
                user: 'sales@reeflimited.com',
                pass: 'cmcxsbpkqvkgpwmk'
            }
        });

        var data = {
            "to": req.body.phone,
            "from": "Mongoro-PIN",
            "sms": "Your code is " + sms_code,
            "type": "plain",
            "api_key": "TLMPIOB7Oe4V8NRRc7KnukwGgTAY9PZLqwVw2DMhrr8o0CEXh4BMmBfN6C0cNf",
            "channel": "generic",
        };
        var options = {
            'method': 'POST',
            'url': 'https://api.ng.termii.com/api/sms/send',
            'headers': {
                'Content-Type': ['application/json', 'application/json']
            },
            body: JSON.stringify(data)

        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
        });

        let mailOptions = {
            from: 'sales@reeflimited.com',
            to: req.body.email,
            subject: 'Verification code',
            html: `<p> Your code is <h1> ${email_code}</h1></p>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        return res.status(200).json({
            code: code,
            status: 200
        })
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

})

router.post("/login", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    const users = await GlobalModel.findOne({ _id: process.env.GLOBAL_ID })
    const value = users.disable_all_user
    const user = await MongoroUserModel.findOne({ email: req.body.email })

    if (!user) {
        res.status(400).json({ msg: "user not found", code: 400 })
    }

    const resultt = user.blocked

    if (resultt === true) {
        res.status(403).json({ msg: "Sorry your account is blocked", code: 403 })
    } else if (value === true) {
        res.status(500).json({ msg: "Sorry service temporarily unavailable", code: 500 })
    } else {
        const originalPassword = await bcrypt.compare(req.body.password, user.password);

        if (!originalPassword) {
            res.status(400).json({ msg: "wrong password", code: 400 })
        } else {
            const accessToken = jwt.sign(
                { id: user._id, isverified: user.isverified },
                process.env.SECRET_KEY,
                { expiresIn: "5h" }
            );

            const ip = address.ip();

            await MongoroUserModel.updateOne({ _id: user._id }, { $set: { ip: ip, active: true } }).then(() => {
                res.status(200).json({ msg: 'logged in successfuly ', user: user, token: accessToken, ip_address: ip, status: 200 });
            })
        }
    }

})

//FORGOTPASSWORD 
router.post("/password_verify", async (req, res) => {

    const email_code = Math.floor(100 + Math.random() * 900)
    const sms_code = Math.floor(100 + Math.random() * 900)
    let code = { email_code, sms_code }

    const user = await MongoroUserModel.findOne({ email: req.body.email });
    const number = user.phone

    if (!user) {
        return res.status(404).json({ msg: 'No User is registered with this email', status: 400 })
    } else {

        let transporter = nodemailer.createTransport({
            service: "hotmail",
            auth: {
                user: 'sales@reeflimited.com',
                pass: 'cmcxsbpkqvkgpwmk'
            }
        });

        let mailOptions = {
            from: 'sales@reeflimited.com',
            to: req.body.email,
            subject: 'Verification code',
            html: `Your code is ${email_code}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        var data = {
            "to": number,
            "from": "Mongoro-PIN",
            "sms": "Your code is " + sms_code,
            "type": "plain",
            "api_key": "TLMPIOB7Oe4V8NRRc7KnukwGgTAY9PZLqwVw2DMhrr8o0CEXh4BMmBfN6C0cNf",
            "channel": "generic",
        };
        var options = {
            'method': 'POST',
            'url': 'https://api.ng.termii.com/api/sms/send',
            'headers': {
                'Content-Type': ['application/json', 'application/json']
            },
            body: JSON.stringify(data)

        };
        request(options, function (error, response) {
            if (error) throw new Error(error);
            console.log(response.body);
        });

        res.status(200).json({
            msg: 'OTP sent successfully!',
            code: code,
            status: 200
        })

    }

})

//setup
router.put('/settings', async (req, res) => {
    const id = req.body.id;


    try {
        if (!req.body.address || !req.body.country || !req.body.state || !req.body.city || !req.body.gender || !req.body.occupation) return res.status(402).json({ msg: 'please check the fields ?' })

        await MongoroUserModel.updateOne({ _id: id }, {
            $set: {
                address: req.body.address,
                state: req.body.state,
                country: req.body.country,
                city: req.body.city,
                gender: req.body.gender,
                date: req.body.date,
                occupation: req.body.occupation,
                setup_complete: true
            }
        }).then(async () => {
            return res.status(200).json({
                msg: 'Account Setup Successfully',
                status: 200
            })
        }).catch((err) => {
            res.send(err)
        })

        console.log(id)

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

})

module.exports = router
