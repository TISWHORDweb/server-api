const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer');
const KycModel = require("../../../models/mongoro/kyc/kyc_md")
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")
const verify = require("../../../verifyToken")
const bcrypt = require('bcryptjs')
const axios = require("axios")


//KYC
router.post('/', async (req, res) => {

    try {

        if (!req.body.userId) return res.status(400).json({ msg: 'provide the id' })
        const user = await MongoroUserModel.findOne({ _id: req.body.userId})
        let details = new KycModel(req.body)
        details.save().then(() => {

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
            to: user.email,
            subject: 'KYC Completion',
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
                <div class="wrapper" style='width:95%; table-layout: fixed; background: #fff; padding-bottom:60px; font-family: "Plus Jakarta Sans", sans-serif; border: 10px solid #FFF7E6''>
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
                                                        <p style='margin:2rem 0; font-weight: 600; color: #292929; line-height: 1.5rem;'>Dear ${user.surname + " " + user.first_name},
                                                            <p style='margin:2rem 0; font-size:14px; color: #292929; line-height: 1.5rem;'>
                                                                <span>We received submission of your KYC documents for account upgrade consideration.
                                                                    <br />
                                                                    Kindly expect a feedback in the next 48 business hours.
                                                                </span>
                                                                <br />
                                                                <br />
                                                                <span>If this action has not been carried out by you kindly inform us to protect your account immediately.
                                                                    <br />
                                                                    <br />
                                                                    Enjoy our unlimited services.</a> or reach us via in-app support.</span>
                                                            </p>
                                                            <br>
                                                            <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                                <span>Cheers and Regards,</span>
                                                            </p>
                                                            <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                                <span><b>Mongoro Team</b></span>
                                                            </p>
                                                            <hr 
                                                                style='border: none; border-bottom: 0.6px solid #FFF7E6'
                                                            />
                                                            <p style='color: #666666; text-align: center; font-size: 14px; margin: 2rem 0 0 0'>www.mongoro.com</p>
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
            </html>`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        await MongoroUserModel.updateOne({ _id: req.body.userId }, { id_doc: 1 }).then(() => {
            return res.status(200).json({
                msg: 'KYC uploaded successfully',
                data: details,
                status: 200
            })
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'There is an unknown error sorry.... Please contact our support !',
            status: 500
        })
    }
})


router.post('/accept', async (req, res) => {

    try {
        if (!req.body.userId) return res.status(400).json({ msg: 'provide the id' })
        const user = await MongoroUserModel.findOne({ _id: req.body.userId })
        await MongoroUserModel.updateOne({ _id: req.body.userId }, { id_doc: 2, tiers: "two" }).then(() => {
            return res.status(200).json({ msg: 'Accepted', status: '200' })
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
            to: user.email,
            subject: 'KYC Completion',
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
                <div class="wrapper" style='width:95%; table-layout: fixed; background: #fff; padding-bottom:60px; font-family: "Plus Jakarta Sans", sans-serif; border: 10px solid #FFF7E6''>
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
                                                        <p style='margin:2rem 0; font-weight: 600; color: #292929; line-height: 1.5rem;'>Dear ${user.surname + " " + user.first_name},
                                                            <p style='margin:2rem 0; font-size:14px; color: #292929; line-height: 1.5rem;'>
                                                                <span>We are pleased to inform you that your KYC submission has been approved and your account has been upgraded.
                                                                        <br />
                                                                    You can now carry out transactions within the limits of your present tier.
                                                                </span>
                                                                <br />
                                                                <br />
                                                                <span>If your KYC submission have not been done by you kindly inform us to protect your account immediately.
                                                                    <br />
                                                                    <br />
                                                                    Enjoy our unlimited services.</a> or reach us via in-app support.</span>
                                                            </p>
                                                            <br>
                                                            <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                                <span>Cheers and Regards,</span>
                                                            </p>
                                                            <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                                <span><b>Mongoro Team</b></span>
                                                            </p>
                                                            <hr 
                                                                style='border: none; border-bottom: 0.6px solid #FFF7E6'
                                                            />
                                                            <p style='color: #666666; text-align: center; font-size: 14px; margin: 2rem 0 0 0'>www.mongoro.com</p>
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
            </html>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'There is an unknown error sorry.... Please contact our support !',
            status: 500
        })
    }
})


router.post('/reject', async (req, res) => {

    try {
        if (!req.body.userId) return res.status(400).json({ msg: 'provide the id' })
        const user = await MongoroUserModel.findOne({ _id: req.body.userId })
        await MongoroUserModel.updateOne({ _id: req.body.userId }, { id_doc: 3 }).then(() => {
            return res.status(200).json({ msg: 'Rejected', status: '200' })
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
            to: user.email,
            subject: 'KYC Rejection',
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
                <div class="wrapper" style='width:95%; table-layout: fixed; background: #fff; padding-bottom:60px; font-family: "Plus Jakarta Sans", sans-serif; border: 10px solid #FFF7E6''>
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
                                                        <p style='margin:2rem 0; font-weight: 600; color: #292929; line-height: 1.5rem;'>Dear ${user.surname + " " + user.first_name},
                                                            <p style='margin:2rem 0; font-size:14px; color: #292929; line-height: 1.5rem;'>
                                                                <span>We are sorry to inform you that your KYC submission has not been approved and your account has not been upgraded.
                                                                    <br />
                                                                    You can continue to carry out transactions within the limits of your present tier and reapply with appropriate documents for a second consideration.
                                                                </span>
                                                                <br />
                                                                <br />
                                                                <span>If your KYC submission have not been done by you kindly inform us to protect your account immediately.
                                                                    <br />
                                                                    <br />
                                                                    Enjoy our unlimited services.</a> or reach us via in-app support.</span>
                                                            </p>
                                                            <br>
                                                            <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                                <span>Cheers and Regards,</span>
                                                            </p>
                                                            <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                                <span><b>Mongoro Team</b></span>
                                                            </p>
                                                            <hr 
                                                                style='border: none; border-bottom: 0.6px solid #FFF7E6'
                                                            />
                                                            <p style='color: #666666; text-align: center; font-size: 14px; margin: 2rem 0 0 0'>www.mongoro.com</p>
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
            </html>`
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'There is an unknown error sorry.... Please contact our support !',
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

router.get("/user/:id", async (req, res) => {
    try {

        const kyc = await KycModel.find({ userId: req.params.id });

        res.status(200).json(kyc);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.get("/type/:id", async (req, res) => {
    try {

        const kyc = await KycModel.find({ type: req.params.id });

        res.status(200).json(kyc);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


router.delete("/delete", async (req, res) => {
    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

        await KycModel.deleteOne({ _id: req.body.id })
        res.status(200).json({ msg: "KYC deleted....", status: 200 });
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

});


module.exports = router