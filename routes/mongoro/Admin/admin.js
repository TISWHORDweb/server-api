const express = require('express')
const router = express.Router()
const SuperModel = require("../../../models/mongoro/admin/super_admin/super_md")
const dotenv = require("dotenv")
const GlobalModel = require('../../../models/mongoro/admin/super_admin/global/global_md')
dotenv.config()
const address = require('address');
const jwt = require("jsonwebtoken")
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
            res.status(500).json({ msg: "your account is blocked", code: 500 })
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
                    html: `your code is ${num}`
                };
        
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

                const ip = address.ip();

                await OtherModel.updateOne({ email: req.body.email }, { $set: { ip: ip } }).then(() => {
                    res.status(200).json({ msg: 'logged in successfuly Admin !', category: "Admin",code:num, email:req.body.email, isverified: admin.isverified, token: accessToken, ip_address: ip, status: 200 });
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