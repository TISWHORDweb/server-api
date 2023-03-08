const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer');
const SuperModel = require("../../../../models/mongoro/admin/super_admin/super_md")
const dotenv = require("dotenv")
const GlobalModel = require('../../../../models/mongoro/admin/super_admin/global/global_md')
const speakeasy = require('speakeasy')
const Qrcode = require('qrcode')
dotenv.config()
const request = require('request');
const bcrypt = require('bcryptjs')

//CREATE
router.post('/create', async (req, res) => {

    // req.body.email_code = Math.floor(100 + Math.random() * 900)
    // req.body.sms_code = Math.floor(100 + Math.random() * 900)

    try {
        if (!req.body.email) return res.status(402).json({ msg: 'please check the fields ?', status: 402 })

        const validate = await SuperModel.findOne({ email: req.body.email })
        if (validate) return res.status(404).json({ msg: 'There is another user with this email ', status: 404 })

        // var data = {
        //     "to": req.body.phone,
        //     "from": "mongoro-PIN",
        //     "sms": "Hi there, testing Termii",
        //     "type": "plain",
        //     "api_key": "TLMPIOB7Oe4V8NRRc7KnukwGgTAY9PZLqwVw2DMhrr8o0CEXh4BMmBfN6C0cNf",
        //     "channel": "generic",
        // };
        // var options = {
        //     'method': 'POST',
        //     'url': 'https://api.ng.termii.com/api/sms/send',
        //     'headers': {
        //         'Content-Type': ['application/json', 'application/json']
        //     },
        //     body: JSON.stringify(data)

        // };
        // request(options, function (error, response) {
        //     if (error) throw new Error(error);
        //     console.log(response.body);
        // });

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
            subject: '2FA Authentication',
            html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Mongoro</title>
                <script src="https://kit.fontawesome.com/13437b109b.js" crossorigin="anonymous"></script>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet">
            </head>
            <body>
                <div class="wrapper" style='width:100%; table-layout: fixed; background: #fff; padding-bottom:60px; font-family: "Plus Jakarta Sans", sans-serif;'>
                    <table class="main" width="100%">
                        
                        <tr>
                            <td>
                                <table width=100% class=sub-main>
                                    <tr>
                                        <td>
                                            <table width=100%>
                                                <tr>
                                                    <td>
                                                        <h3 class="header" style='color: #161616'>Welcome to Mongoro 🚀 </h3>
                                                        <p style='margin:2rem 0; color: #161616; line-height: 1.5rem;'>
                                                                Thanks for joining Mongoro. To access your dashboard, please verify your account by clicking the button below and proceed to change your password.
                                                            <br>
                                                            <div style='padding: 1rem; background: #EAEDC6'><a href="https://mongoro-ad.netlify.app/change-password" style="text-decoration:none">
                                                                <button 
                                                                    style='font-family: "Plus Jakarta Sans", sans-serif; width: 15rem; color: #fff; background: #ffab01; border: none; display: block; margin: 0 auto; padding: 0.8rem; font-weight: 600; border-radius: 4px;'
                                                                >
                                                                    Activate your account and log in
                                                                </button></a>
                                                            </div>
                                                            
                                                            <p style='margin:2rem 0; color: #161616; line-height: 1.5rem;'>
                                                                <span>Thanks,</span>
                                                            </p>
                                                            <p style='margin:2rem 0; color: #161616; line-height: 1.5rem;'>
                                                                <span><b>Support Team, Mongoro Team</b></span>
                                                            </p>
                                                            <hr 
                                                                style='border: none; border-bottom: 0.6px solid #FFF7E6'
                                                            />
                                                            <p style='color: #666666; text-align: center; font-size: 14px; margin: 2rem 0 0 0'>+234 09169451169</p>
                                                            <p style='color: #666666; text-align: center; font-size: 14px;'>sales@mongoro.com</p>
                                                            <p style='color: #666666; text-align: center; font-size: 14px;'>Space 27, Novare Mall, Wuse Zone 5, Abuja</p>
                                                            <p style='color: #666666; text-align: center; font-size: 14px; margin: 2rem 0 0 0'> Having trouble viewing this email? Click here to view in your browser.</p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </div>
            </body>
            </html>`
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
                msg: 'Congratulation you are now super admin ',
                user: user,
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

router.get("/all", async (req, res) => {
    try {
        const user = await SuperModel.find();
        res.status(200).json(user.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.put("/disable_all_user", async (req, res) => {
    try {
        await GlobalModel.updateOne({ _id: process.env.GLOBAL_ID }, { $set: { disable_all_user: true, by: req.body.by, updated_at: Date.now() } }).then(async () => {
        })
        res.status(200).json({msg:"user Disabled successfully"})
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.put("/enable_all_user", async (req, res) => {
    try {
        await GlobalModel.updateOne({ _id: process.env.GLOBAL_ID }, { $set: { disable_all_user: false, by: req.body.by, updated_at: Date.now() } }).then(async () => {
        })
        res.status(200).json({msg:"user Enabled successfully"})
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.put("/disable_all_transaction", async (req, res) => {
    try {
        await GlobalModel.updateOne({ _id: process.env.GLOBAL_ID }, { $set: { disable_all_transfer: true, by: req.body.by, updated_at: Date.now() } }).then(async () => {
        })
        res.status(200).json({msg:"Transfer Disabled successfully"})
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.put("/enable_all_transaction", async (req, res) => {
    try {
        await GlobalModel.updateOne({ _id: process.env.GLOBAL_ID }, { $set: { disable_all_transfer: false, by: req.body.by, updated_at: Date.now() } }).then(async () => {
        })
        res.status(200).json({msg:"Transfer Enabled successfully"})
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


// router.post("/check", async (req, res) => {

//     const user = await SuperModel.findOne({ email_code: req.body.email_code });

//     if (user == null) {
//         console.log("Wrong Inputs");
//         res.status(401).json({ msg: "wrong Inputs ", status: 401 });
//     } else if (user.email_code != req.body.email_code || user.sms_code != req.body.sms_code) {
//         res.status(401).json({ msg: 'wrong Codes ', status: 401 });
//     } else {
//         res.status(200).json({ msg: 'Super Admin verified successfuly ', status: 200 });
//     }
// })

router.post('/password', async (req, res) => {

    try {

        const supers = await SuperModel.findOne({ email: req.body.email })
        
        if (!req.body.email) return res.status(401).json({ msg: 'provide the id ?' })

        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 13)
        }    

        if(supers){
            await SuperModel.updateOne({ email: req.body.email }, { $set: { password: req.body.password } }).then(async () => {
                let super_admin = await SuperModel.findOne({ email: req.body.email })
                return res.status(200).json({
                    msg: 'Password created Successfully ',
                    super:super_admin,
                    status: 200
                })
            }).catch((err) => {
                res.send(err)
            })
        }else{
            res.status(400).json({
                msg: 'you dont have access or invalid email ',
                status: 400
            })
        }

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

})



router.get('/token', async (req, res) => {

    let secret = speakeasy.generateSecret({
        name: "Mongoro"
    })

    Qrcode.toDataURL(secret.otpauth_url, async function (err, data) {
        return res.status(200).json({
            msg: 'token created Successfully ',
            secret: secret,
            data: data,
            status: 200
        })
    })

})

router.post('/verify', async (req, res) => {

    let verified = speakeasy.totp.verify({
        secret: req.body.secret,
        encodeing: 'ascii',
        token: req.body.token
    })

    if (verified == true) {
        return res.status(200).json({
            msg: 'verified Successfully ',
            status: 200
        })
    } else {
        res.status(500).json({
            msg: 'incorrect code !',
            status: 500
        })
    }

})


module.exports = router
