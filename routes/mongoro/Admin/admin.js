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
const AdminAuditModel = require("../../../models/mongoro/admin/audit/audit_md")
const CryptoJS = require('crypto-js');
const bankCodeModel = require('../../../models/mongoro/auth/user/bank/bankCode_md')
const axios = require('axios')
const ipapi = require('ipapi.co');

router.post("/login", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    const supers = await SuperModel.findOne({ email: req.body.email })

    let admin = await OtherModel.findOne({ email: req.body.email })

    // if (!user) {
    //     res.status(400).json({ msg: "user not found", code: 400 })
    // } 
    // const resultt = user.blocked

    // const num = Math.floor(100000 + Math.random() * 900000)

    if (admin) {

        if (admin.blocked === true) {
            res.status(400).json({ msg: "your account is blocked", status: 400 })

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
                
                let add;
                const timeElapsed = Date.now();
                const today = new Date(timeElapsed);
                const when = today.toUTCString();
                const ip = address.ip();

                var callback = function(locate){
                    add=locate.ip
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
                                                <p style='margin:2rem 0; font-weight: 800; color: #292929; line-height: 1.5rem;'>Dear ${admin.email}
                                                    <p style='margin:2rem 0; font-size:14px; color: #292929; line-height: 1.5rem;'>
                                                    <span> We noticed your Mongoro account was logged in on ${req.body.device}
                                                     from ${locate.city}, ${locate.region}, ${locate.country_name},
                                                       name with the IP address ${locate.ip}, at ${when}. If this was you, 
                                                       there is no need to do anything.
                                                    </span>
                                                        <br />
                                                        <br />
                                                        <span>Not you? Change your password and kindly send an email to
                                                        <a href='mailto:support@mongoro.com'>support@mongoro.com</a>
                                                         or reach us via in-app support.</span>
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
    </html>`,
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.log(error);
                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });
                };
            
                ipapi.location(callback)
             
                await OtherModel.updateOne({ email: req.body.email }, { $set: { ip: add } }).then(() => {
                    res.status(200).json({ msg: 'logged in successfuly Admin !', category: "Admin", _id: admin._id, email: req.body.email, isverified: admin.isverified, token: accessToken, ip_address: ip, status: 200 });
                })
            }
        }

    } else if (supers) {

        if (supers.code !== req.body.password) {
            res.status(400).json({ msg: "Super Admin wrong password", code: 400 })
        } else {
            const accessToken = jwt.sign(
                { email: req.body.email },
                process.env.SECRET_KEY,
                { expiresIn: "5h" }
            );

            const ip = address.ip();
            const timeElapsed = Date.now();
            const today = new Date(timeElapsed);
            const when = today.toUTCString();

            let add;
            var callback = function(locate){
                add=locate.ip
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
                                            <p style='margin:2rem 0; font-weight: 800; color: #292929; line-height: 1.5rem;'>Dear ${supers.email}
                                                <p style='margin:2rem 0; font-size:14px; color: #292929; line-height: 1.5rem;'>
                                                <span> We noticed your Mongoro account was logged in on ${req.body.device}
                                                     from ${locate.city}, ${locate.region}, ${locate.country_name},
                                                       name with the IP address ${locate.ip}, at ${when}. If this was you, 
                                                       there is no need to do anything.
                                                    </span>
                                                    <br />
                                                    <br />
                                                    <span>Not you? Change your password and kindly send an email to
                                                    <a href='mailto:support@mongoro.com'>support@mongoro.com</a>
                                                     or reach us via in-app support.</span>
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
</html>`,
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });
          
            }

            ipapi.location(callback)

            await SuperModel.updateOne({ email: req.body.email }, { $set: { ip: add } }).then(() => {
                res.status(200).json({ msg: 'logged in successfuly Super Admin', category: "Super Admin", _id: supers._id, email: req.body.email, token: accessToken, ip_address: ip, status: 200 });
            })
        }

    } else {
        res.status(400).json({ msg: "wrong email and password ", code: 400 })
    }
})


//////AUDIT
router.post('/audit', async (req, res) => {
    try {
        if (!req.body.adminId) return res.status(400).json({ msg: 'provide the id', status: 400 })

        const admin = await OtherModel.findOne({ _id: req.body.adminId });
        const supers = await SuperModel.findOne({ _id: req.body.adminId });

        if (admin) {
            req.body.email = admin.email
            req.body.category = admin.category
            req.body.ip = address.ip();

            let activity = new AdminAuditModel(req.body)
            activity.save().then(() => {
                return res.status(200).json({
                    msg: 'Details added Successful ',
                    status: 200
                })
            })
        } else if (supers) {
            req.body.email = supers.email
            req.body.category = supers.category
            req.body.ip = address.ip();

            let activity = new AdminAuditModel(req.body)
            activity.save().then(() => {
                return res.status(200).json({
                    msg: 'Details added Successful ',
                    status: 200
                })
            })
        } else {
            res.status(400).json({ msg: 'User not found, status: 400' })
        }

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.get('/audit/all', paginatedResults(AdminAuditModel), (req, res) => {
    res.json(res.paginatedResults)
})

function paginatedResults(model) {
    return async (req, res, next) => {
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const action = {}

        if (endIndex < await model.countDocuments().exec()) {
            action.next = {
                page: page + 1,
                limit: limit
            }
        }

        if (startIndex > 0) {
            action.previous = {
                page: page - 1,
                limit: limit
            }
        }

        try {
            const results = await model.find().sort({ _id: -1 }).limit(limit).skip(startIndex).exec()
            let count = await AdminAuditModel.count()
            res.paginatedResults = { action, results, TotalResult: count, Totalpages: Math.ceil(count / limit) }
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}


// router.get("/audit/all", async (req, res) => {
//     try {
//         const audit = await AdminAuditModel.find();
//         res.status(200).json(audit.reverse());
//     } catch (err) {
//         res.status(500).json({
//             msg: 'there is an unknown error sorry !',
//             status: 500
//         })
//     }
// })

router.get('/audit/:id', async (req, res) => {
    try {
        if (!req.params.id) return res.status(400).json({ msg: 'provide the id ', status: 400 })

        let audit = await AdminAuditModel.findOne({ _id: req.params.id })
        if (audit) {
            return res.status(200).json({
                audit,
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

router.get('/audit/admin/:id', async (req, res) => {
    try {
        if (!req.params.id) return res.status(400).json({ msg: 'provide the id ', status: 400 })

        let audit = await AdminAuditModel.find({ adminId: req.params.id })
        if (audit) {
            return res.status(200).json({
                audit,
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


router.delete('/audit/delete', async (req, res) => {
    try {
        if (!req.body.id) return res.status(400).json({ msg: 'provide the id ', status: 402 })

        await AdminAuditModel.deleteOne({ _id: req.body.id })
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


router.post('/bank/deactivate', async (req, res) => {
    try {
        if (!req.body.code) return res.status(400).json({ msg: 'provide the code ', status: 402 })

        const validate = await bankCodeModel.findOne({ code: req.body.code })

        if (validate) {
            return res.status(400).json({
                msg: "Bank deactivated already",
                status: 400
            })
        }

        const code = await new bankCodeModel(req.body)
        code.save()
        return res.status(200).json({
            msg: "Deactivated successfully",
            status: 200
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.get('/bank/all', async (req, res) => {
    try {
        const code = await bankCodeModel.find()

        let filtered = []
        code.filter((a)=>{
            filtered.push(a.code)
        })

        const url = "https://api.youverify.co/v2/api/identity/ng/bank-account-number/bank-list"

        const header = {
            headers: {
                token: process.env.U_VERIFY_KEY
            }
        }

        await axios.get(url, header).then(resp => {
            const data = resp.data.data
            data.forEach(element => {
                element.status = true
                if(filtered.includes(element.code)){
                    element.status = false
                }
            })
            res.status(200).json(resp.data)
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.post('/bank/activate', async (req, res) => {
    try {

        const validate = await bankCodeModel.findOne({ _id: req.body.id })

        if (!validate) {
            return res.status(400).json({
                msg: "Bank activated already",
                status: 400
            })
        }

        await bankCodeModel.deleteOne({ _id: req.body.id })

        return res.status(200).json({
            msg: "Bank activated successfully",
            status: 200
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})


router.get('/bank/deactivate/all', async (req, res) => {
    try {

        const bank = await bankCodeModel.find()

        return res.status(200).json(bank)

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

module.exports = router