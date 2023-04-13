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
const axios = require('axios');
const { notify } = require('../../../core/core.utils');
const note = require('../../../note.json')

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
        if (!req.body.email || !req.body.usertag || !req.body.surname || !req.body.first_name || !req.body.password || !req.body.phone) return res.status(402).json({
            msg: 'please check the fields ?',
            status: 402
        })

        const validate = await MongoroUserModel.findOne({wallet_ID: req.body.wallet_ID})
        if (validate) return res.status(400).json({msg: 'There is another user with this Username', status: 400})

        const validates = await MongoroUserModel.findOne({email: req.body.email})
        if (validates) return res.status(404).json({msg: 'There is another user with this email ', status: 404})

        let user = await new MongoroUserModel(req.body)

        await user.save().then(user => {

            const accessToken = jwt.sign(
                {id: user._id},
                process.env.SECRET_KEY,
                {expiresIn: "5h"}
            );


            let transporter = nodemailer.createTransport({
                service: "hotmail",
                auth: {
                    user: 'support@mongoro.com',
                    pass: 'cmcxsbpkqvkgpwmk'
                }
            });
    
            let mailOptions = {
                from: 'support@mongoro.com',
                to: req.body.email,
                subject: 'Verification code',
                html: `
                <!DOCTYPE html>
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
<div class="wrapper" style='width:95%; table-layout: fixed; background: #fff; padding-bottom:60px; font-family: "Plus Jakarta Sans", sans-serif; border: 10px solid #FFF7E6'>
    <table class="main" width="100%">
        <tr>
            <td>
                <table width=100% class=sub-main>
                    <tr>
                        <td>
                            <a>
                                <div style='padding: 1rem; background: #FFF7E6;'>
                                    <img 
                                        style='width: 7rem; display: block; margin: 0 auto'
                                        src='http://res.cloudinary.com/dszrk3lcz/image/upload/v1681388703/dqfex6vpnnncytqrtntx.png' 
                                        alt=''
                                    />
                                </div>
                            </a>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <table width=100% style="padding: 0 9px">
                                <tr>
                                    <td>
                                        <p style='margin:2rem 0; font-weight: 800; color: #292929; line-height: 1.5rem;'>Welcome to Mongoro 🚀
                                            <p style='margin:2rem 0; font-size:14px; color: #292929; line-height: 1.5rem;'>
                                            <span>  Thanks for joining Mongoro. You can now access the dashboard, Enjoy banking with us.
                                            </span>
                                                <br />
                                                <br />
                                        </p>
                                            <br>
                                            
                                            <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                <span>Regards,</span>
                                            </p>
                                            <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                <span><b>Mongoro Team</b></span>
                                            </p>
                                            <hr 
                                                style='border: none; border-bottom: 0.6px solid #FFAB01'
                                            />
                                            <p style='color: #666666; text-align: center; font-size: 14px; margin: 2rem 0 0 0'>+2348033550170</p>
                                            <p style='color: #666666; text-align: center; font-size: 14px;'>support@mongoro.com</p>
                                            <p style='color: #666666; text-align: center; font-size: 14px;'>21 Blantyre Crescent, Wuse 2. Abuja</p>
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
</html>`,
            };
            transporter.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

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

        await MongoroUserModel.updateOne({email: req.body.email}, {$set: {isverified: true}})

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

        let code = Math.floor(100000 + Math.random() * 900000)
        console.log(req.body.phone)

        const url = "https://api.sendchamp.com/api/v1/sms/send"
        const header = {
            headers: {
                Authorization: `Bearer ${process.env.SENDCHAMP}`
            }
        }
        axios.post(url, {
            "to": req.body.phone,
            "route": "dnd",
            "message": `Thanks for joining Mongoro. To access the dashboard, please verify your account by entering this code ${code} and proceed to login.`,
            "sender_name": "MONGORO-PIN"
        }, header).then(function (response) {
            console.log(JSON.stringify(response.data));
        })

        let transporter = nodemailer.createTransport({
            service: "hotmail",
            auth: {
                user: 'support@mongoro.com',
                pass: 'cmcxsbpkqvkgpwmk'
            }
        });

        let mailOptions = {
            from: 'support@mongoro.com',
            to: req.body.email,
            subject: 'Verification code',
            html:`<!DOCTYPE html>
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
                                            <a>
                                                <div style='padding: 1rem; background: #FFF7E6;'>
                                                    <img 
                                                        style='width: 7rem; display: block; margin: 0 auto'
                                                        src='http://res.cloudinary.com/dszrk3lcz/image/upload/v1681388703/dqfex6vpnnncytqrtntx.png' 
                                                        alt=''
                                                    />
                                                </div>
                                                
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table width=100%>
                                                <tr>
                                                    <td>
                                                        <p style='margin:2rem 0; font-weight: 600; color: #292929; line-height: 1.5rem;'>Welcome to Mongoro 🚀
                                                            <p style='margin:2rem 0; font-size:14px; color: #292929; line-height: 1.5rem;'>
                                                                <span> Thanks for joining Mongoro. To access the dashboard, please verify your account by entering the code below and proceed to login.</span>
                                                            </p>
                                                            <br>
                                                            <p style='margin:0rem 0; color: #292929; line-height: 1.5rem; font-size: 35px; text-align: left;'>
                                                                <span><b>${code}</b></span>
                                                            </p>
                                                            
                                                            <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                                <span>Regards,</span>
                                                            </p>
                                                            <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                                <span><b>Mongoro Team</b></span>
                                                            </p>
                                                            <hr 
                                                                style='border: none; border-bottom: 0.6px solid #FFF7E6'
                                                            />
                                                        
                                                            <p style='color: #666666; text-align: center; font-size: 14px; margin: 2rem 0 0 0'>+2348033550170</p>
                                                            <p style='color: #666666; text-align: center; font-size: 14px;'>support@mongoro.com</p>
                                                            <p style='color: #666666; text-align: center; font-size: 14px;'>21 Blantyre Crescent, Wuse 2. Abuja</p>
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
            </html>`,
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

    let UserPassword;

    const users = await GlobalModel.findOne({_id: process.env.GLOBAL_ID})
    const value = users.disable_all_user
    const user = await MongoroUserModel.findOne({email: req.body.email})
    let resultt;
    if (user) {
        resultt = user.blocked
        UserPassword = user.password

        //update user if regToken is passed
        if (!!req.body.registration_token) await user.update({registration_token: req.body.registration_token})

    } else if (resultt === true) {
        res.status(403).json({msg: "Sorry your account is blocked", code: 403})
    } else if (value === true) {
        res.status(500).json({msg: "Sorry service temporarily unavailable", code: 500})
    } else {
        res.status(400).json({msg: "user not found", code: 400})
    }


    if (UserPassword) {
        const originalPassword = await bcrypt.compare(req.body.password, UserPassword);

        if (!originalPassword) {
            res.status(400).json({msg: "wrong password", code: 400})
        } else {
            const accessToken = jwt.sign(
                {id: user._id, isverified: user.isverified},
                process.env.SECRET_KEY,
                {expiresIn: "5h"}
            );

            var configs = {
                method: 'get',
                url: `https://api.ipdata.co?api-key=e93f292bf9211a39c987943a79d8bed8a9370fe943db7ac74f81084e`,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            axios(configs).then(function (response) {
                const result = response.data

                // if(user.login_alert.email === true){
                    let transporter = nodemailer.createTransport({
                        service: "hotmail",
                        auth: {
                            user: 'support@mongoro.com',
                            pass: 'cmcxsbpkqvkgpwmk'
                        }
                    });
        
                    let mailOptions = {
                        from: 'support@mongoro.com',
                        to: req.body.email,
                        subject: 'New login detected',
                        html: `
                        <!DOCTYPE html>
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
        <div class="wrapper" style='width:95%; table-layout: fixed; background: #fff; padding-bottom:60px; font-family: "Plus Jakarta Sans", sans-serif; border: 10px solid #FFF7E6'>
            <table class="main" width="100%">
                <tr>
                    <td>
                        <table width=100% class=sub-main>
                            <tr>
                                <td>
                                    <a>
                                        <div style='padding: 1rem; background: #FFF7E6;'>
                                            <img 
                                                style='width: 7rem; display: block; margin: 0 auto'
                                                src='http://res.cloudinary.com/dszrk3lcz/image/upload/v1681388703/dqfex6vpnnncytqrtntx.png' 
                                                alt=''
                                            />
                                        </div>
                                    </a>
                                </td>
                            </tr>
                            <tr>
                                <td>
                                    <table width=100% style="padding: 0 9px">
                                        <tr>
                                            <td>
                                                <p style='margin:2rem 0; font-weight: 800; color: #292929; line-height: 1.5rem;'>Dear ${user.surname + " " + user.first_name},
                                                    <p style='margin:2rem 0; font-size:14px; color: #292929; line-height: 1.5rem;'>
                                                    <span> We noticed a recently sign in to your account from ${result.city}, ${result.region}, ${result.country_name} - ${result.continent_name} on a ${req.body.device} name with the IP address ${ip}, at ${when}.
                                                    </span>
                                                        <br />
                                                        <br />
                                                    <span>If this login has not originated from you, Change your password and kindly send an email to <a href='mailto:support@mongoro.com'>support@mongoro.com</a> or reach us via in-app support.</span>
                                                </p>
                                                    <br>
                                                    
                                                    <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                        <span>Regards,</span>
                                                    </p>
                                                    <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                        <span><b>Mongoro Team</b></span>
                                                    </p>
                                                    <hr 
                                                        style='border: none; border-bottom: 0.6px solid #FFAB01'
                                                    />
                                                    <p style='color: #666666; text-align: center; font-size: 14px; margin: 2rem 0 0 0'>+2348033550170</p>
                                                    <p style='color: #666666; text-align: center; font-size: 14px;'>support@mongoro.com</p>
                                                    <p style='color: #666666; text-align: center; font-size: 14px;'>21 Blantyre Crescent, Wuse 2. Abuja</p>
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
    </html>`,
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                // }

                let note = {
                    title: "Login Alert",
                    body: ` We noticed a recently sign in to your account from ${result.city}, ${result.region}, ${result.country_name} - ${result.continent_name} on a ${req.body.device} name with the IP address ${ip}, at ${when}. If this login has not originated from you, kindly send an email to support@mongoro.com, or reach us via in-app support.`
                };
            
                let data = 'channelId'
    
                
    
                notify(user._id, note.title, note.body, data)
            })

            const ip = address.ip();
            const timeElapsed = Date.now();
            const today = new Date(timeElapsed);
            const when = today.toUTCString();


            await MongoroUserModel.updateOne({_id: user._id}, {$set: {ip: ip, active: true}}).then(() => {
                res.status(200).json({
                    msg: 'logged in successfuly ',
                    user: user,
                    token: accessToken,
                    ip_address: ip,
                    status: 200
                });
            })
        }
    }
})

//FORGOTPASSWORD 
router.post("/password_verify", async (req, res) => {

    let code = Math.floor(100000 + Math.random() * 900000)

    const user = await MongoroUserModel.findOne({email: req.body.email});

    if (!user) {
        return res.status(404).json({msg: 'No User is registered with this email', status: 400})
    } else {

        const number = user.phone

        let transporter = nodemailer.createTransport({
            service: "hotmail",
            auth: {
                user: 'support@mongoro.com',
                pass: 'cmcxsbpkqvkgpwmk'
            }
        });

        let mailOptions = {
            from: 'support@mongoro.com',
            to: req.body.email,
            subject: 'Password Recovery',
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
                                            <a>
                                                <div style='padding: 1rem; background: #FFF7E6;'>
                                                    <img 
                                                        style='width: 7rem; display: block; margin: 0 auto'
                                                        src='http://res.cloudinary.com/dszrk3lcz/image/upload/v1681388703/dqfex6vpnnncytqrtntx.png' 
                                                        alt=''
                                                    />
                                                </div>
                                                
                                            </a>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>
                                            <table width=100%>
                                                <tr>
                                                    <td>
                                                        <p style='margin:2rem 0; font-weight: 600; color: #292929; line-height: 1.5rem;'>Verification code
                                                            <p style='margin:2rem 0; font-size:14px; color: #292929; line-height: 1.5rem;'>
                                                                <span>   To change your password, Please enter the code below</span>
                                                            </p>
                                                            <br>
                                                            <p style='margin:0rem 0; color: #292929; line-height: 1.5rem; font-size: 35px; text-align: left;'>
                                                                <span><b>${code}</b></span>
                                                            </p>
                                                            
                                                            <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                                <span>Regards,</span>
                                                            </p>
                                                            <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                                <span><b>Mongoro Team</b></span>
                                                            </p>
                                                            <hr 
                                                                style='border: none; border-bottom: 0.6px solid #FFF7E6'
                                                            />
                                                        
                                                            <p style='color: #666666; text-align: center; font-size: 14px; margin: 2rem 0 0 0'>+2348033550170</p>
                                                            <p style='color: #666666; text-align: center; font-size: 14px;'>support@mongoro.com</p>
                                                            <p style='color: #666666; text-align: center; font-size: 14px;'>21 Blantyre Crescent, Wuse 2. Abuja</p>
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
            </html>`,
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
            "sms": " To change your password, Please enter the code " + code,
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
        if (!req.body.address || !req.body.country || !req.body.state || !req.body.city || !req.body.gender || !req.body.occupation) return res.status(402).json({msg: 'please check the fields ?'})

        await MongoroUserModel.updateOne({_id: id}, {
            $set: {
                address: req.body.address,
                state: req.body.state,
                country: req.body.country,
                city: req.body.city,
                gender: req.body.gender,
                date_of_birth: req.body.date_of_birth,
                occupation: req.body.occupation,
                setup_complete: true,
                user_updated_at: Date.now()
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

router.post('/verify_email', async (req, res) => {

    const user = await MongoroUserModel.findOne({email: req.body.email});

    if (user) {
        res.status(400).json({msg: false, status: 400});
    } else {
        res.status(200).json({msg: true, status: 200});
    }

})

router.post('/sendchamp', async (req, res) => {

    const url = "https://api.sendchamp.com/api/v1/sms/send"
    const header = {
        headers: {
            Authorization: `Bearer ${process.env.SENDCHAMP}`
        }
    }
    await axios.post(url, {
        "to": req.body.to,
        "route": "dnd",
        "message": req.body.message,
        "sender_name": "Sendchamp"
    }, header).then(function (response) {
        console.log(JSON.stringify(response.data));
    })
})

module.exports = router
