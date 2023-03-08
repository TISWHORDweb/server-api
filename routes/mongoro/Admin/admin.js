const express = require('express')
const router = express.Router()
const SuperModel = require("../../../models/mongoro/admin/super_admin/super_md")
const dotenv = require("dotenv")
const GlobalModel = require('../../../models/mongoro/admin/super_admin/global/global_md')
dotenv.config()
const address = require('address');
const jwt = require("jsonwebtoken")
const nodemailer = require('nodemailer');
const bcrypt = require('bcryptjs')
const OtherModel = require('../../../models/mongoro/admin/other/otherAdmi_md')



router.post("/login", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    const supers = await SuperModel.findOne({ email: req.body.email })

    const admin = await OtherModel.findOne({ email: req.body.email })

    // if (!user) {
    //     res.status(400).json({ msg: "user not found", code: 400 })
    // } 
    // const resultt = user.blocked

    const num =  Math.floor(100000 + Math.random() * 900000)

    if (admin) {

        if (admin.blocked === true) {
            res.status(400).json({ msg: "your account is blocked", status: 400 })
        } else if(admin.isverified === false){

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
                                                                    Thanks for joining Mongoro. To access the admin dashboard, please verify your account by entering the code below and proceed to change your password.
                                                                <br>
                                                                <p style='margin:3rem 0; color: #161616; line-height: 1.5rem; font-size: 45px; text-align: center;'>
                                                                    <span><b>${num}</b></span>
                                                                </p>
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

            const accessToken = jwt.sign(
                { email: req.body.email },
                process.env.SECRET_KEY,
                { expiresIn: "5h" }
            );

            const ip = address.ip();

            await OtherModel.updateOne({ email: req.body.email }, { $set: { code: num } })
            res.send({ msg: "your account is not verified", category: "Admin", email:req.body.email, isverified: admin.isverified, token: accessToken, ip_address: ip,   })

        } else {

            const originalPassword = await bcrypt.compare(req.body.password, admin.password);

            if (!originalPassword) {
                res.status(400).json({ msg: " Admin wrong password", code: 400 })
            } else {
                const accessToken = jwt.sign(
                    { email: req.body.email },
                    process.env.SECRET_KEY,
                    { expiresIn: "5h" }
                );

                const ip = address.ip();

                await OtherModel.updateOne({ email: req.body.email }, { $set: { ip: ip } }).then(() => {
                    res.status(200).json({ msg: 'logged in successfuly Admin !', category: "Admin", email:req.body.email, isverified: admin.isverified, token: accessToken, ip_address: ip, status: 200 });
                })
            }
        }

    } else if (supers) {

        const originalPassword = await bcrypt.compare(req.body.password, supers.password);

        if (!originalPassword) {
            res.status(400).json({ msg: "Super Admin wrong password", code: 400 })
        } else {
            const accessToken = jwt.sign(
                { email: req.body.email },
                process.env.SECRET_KEY,
                { expiresIn: "5h" }
            );

            const ip = address.ip();

            await SuperModel.updateOne({ email: req.body.email }, { $set: { ip: ip } }).then(() => {
                res.status(200).json({ msg: 'logged in successfuly Super Admin', category: "Super Admin",  email:req.body.email, token: accessToken, ip_address: ip, status: 200 });
            })
        }

    } else {
        res.status(400).json({ msg: "wrong email and password ", code: 403 })
    }
})


module.exports = router