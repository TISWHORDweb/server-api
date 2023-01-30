const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer');
const SuperModel = require("../../../../models/mongoro/admin/super_admin/super_md")
const dotenv = require("dotenv")
const speakeasy = require('speakeasy')
const Qrcode = require('qrcode')
const commons = require('./commons');
dotenv.config()
const request = require('request');

//CREATE
router.post('/create', async (req, res) => {

    req.body.email_code = Math.floor(1000 + Math.random() * 9000)
    req.body.sms_code = Math.floor(1000 + Math.random() * 9000)

    try {
        if (!req.body.email || !req.body.phone) return res.status(402).json({ msg: 'please check the fields ?' })

        const validate = await SuperModel.findOne({ email: req.body.email })
        if (validate) return res.status(404).json({ msg: 'There is another user with this email !' })

        var data = {
            "to": req.body.phone,
            "from": "N-Alert",
            "sms": "Hi there, testing Termii",
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
            html: ''
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        let user = await new SuperModel(req.body)

        await user.save().then(user => {
            return res.status(200).json({
                msg: 'Congratulation you are now super admin !!!',
                user: user
            })
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }
})

router.get("/all", async (req, res) => {
    try {
        const user = await SuperModel.find();
        res.status(200).json(user.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }
})

router.post("/check", async (req, res) => {

    const user = await SuperModel.findOne({ email_code: req.body.email_code });

    if (user == null) {
        console.log("Wrong Inputs");
        res.status(401).json({ msg: "wrong Inputs !" });
    } else if (user.email_code != req.body.email_code || user.sms_code != req.body.sms_code) {
        res.status(401).json({ msg: 'wrong Codes !', });
    } else {
        res.status(200).json({ msg: 'Super Admin verified successfuly !' });
    }
})

router.put('/password', async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    let { id } = body;

    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

        await SuperModel.updateOne({ _id: id }, body).then(async () => {
            let user = await SuperModel.findOne({ _id: id })
            return res.status(200).json({
                msg: 'Password created Successfully !!!',
                user: user
            })
        }).catch((err) => {
            res.send(err)
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }

})


router.get('/token', async (req, res) => {

    let secret = speakeasy.generateSecret({
        name: "Mongoro"
    })

    Qrcode.toDataURL(secret.otpauth_url, async function (err, data) {
        return res.status(200).json({
            msg: 'token created Successfully !!!',
            secret: secret,
            data: data
        })
    })

})

router.post('/verify', async (req, res) => {

    let verified = speakeasy.totp.verify({
        secret: req.body.secret,
        encodeing: 'ascii',
        token: req.body.token
    })

    if(verified == true){
        return res.status(200).json({
            msg: 'verified Successfully !!!'
        })
    }else{
        res.status(500).json({
            msg: 'incorrect code !'
        })
    }

})


module.exports = router
