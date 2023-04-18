const express = require('express')
const router = express.Router()
const MongoroUserModel = require("../../../../../models/mongoro/auth/mongoroUser_md")
const OtherModel = require('../../../../../models/mongoro/admin/other/otherAdmi_md')
const SuperModel = require('../../../../../models/mongoro/admin/super_admin/super_md')
const CategoryModel = require("../../../../../models/mongoro/admin/super_admin/category/category")
const dotenv = require("dotenv")
const nodemailer = require('nodemailer');
dotenv.config()


//CREATEr
router.post('/create', async (req, res) => {

    try {

        if (!req.body.category) return res.status(402).json({ msg: 'please check the fields ?' })

        const user = await SuperModel.findOne({ email: req.body.super_email })

        const validate = await CategoryModel.findOne({ category: req.body.category })
        if (validate) return res.status(404).json({ msg: 'Category exist already ' })

        if (user) {
            let category = await new CategoryModel(req.body)

            await category.save().then(category => {
                return res.status(200).json({
                    msg: 'Category created successfully ',
                    category: category,
                    status: 200
                })
            })

        } else {
            res.status(400).json({
                msg: 'you dont have access to create category',
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

router.get("/allcategory", async (req, res) => {
    try {
        const category = await CategoryModel.find();
        res.status(200).json(category.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.get("/allinvited", async (req, res) => {
    try {
        const category = await OtherModel.find();
        res.status(200).json(category.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.get("/of/:category", async (req, res) => {
    try {

        const admin = await OtherModel.find({ category: req.params.category });

        res.status(200).json(admin);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.put('/edit', async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    let { id } = body;

    try {

        const validate = await CategoryModel.findOne({ category: req.body.category })
        if (validate) return res.status(400).json({ msg: 'Category exist already ' })

        const check = await CategoryModel.findOne({ _id: req.body.id })
        if (!check) return res.status(400).json({ msg: 'No category with the provided id ' })

        const user = await SuperModel.findOne({ email: req.body.super_email })

        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        if (user) {

            await CategoryModel.updateOne({ _id: id }, body).then(async () => {

                let category = await CategoryModel.findOne({ _id: id })
                await CategoryModel.updateOne({ updated_at: category.updated_at }, { $set: { updated_at: Date.now() } })
                return res.status(200).json({
                    msg: 'Category Updated Successfully ',
                    category: category,
                    status: 200
                })
            }).catch((err) => {
                res.send(err)
            })
        } else {
            res.status(400).json({
                msg: 'you dont have access to edit category',
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

router.delete("/delete", async (req, res) => {
    try {

        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

        const check = await CategoryModel.findOne({ _id: req.body.id })
        if (!check) return res.status(400).json({ msg: 'No category with the provided id ' })

        const supers = await SuperModel.findOne({ email: req.body.super_email })

        if (supers) {
            await CategoryModel.deleteOne({ _id: req.body.id })
            res.status(200).json({ msg: "Category deleted....", status: 200 });
        } else {
            res.status(400).json({
                msg: 'you dont have access to delete category',
                status: 400
            })
        }

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

});



//INVITE    
router.post("/invite", async (req, res) => {

    const supers = await SuperModel.findOne({ _id: req.body.superId })

    const user = await MongoroUserModel.findOne({ email: req.body.email });

    const Supermail = await SuperModel.findOne({ email: req.body.email });

    const admin = await OtherModel.findOne({ email: req.body.email });

    const validate = await CategoryModel.findOne({ name: req.body.category })
    if (!validate) return res.status(404).json({ msg: 'There is no such category !' })

    if (!supers) {
        res.status(400).json({
            msg: 'you dont have access to Invite Admin',
            status: 400
        })
    } 
    // else if (user) {
    //     res.status(400).json({ msg: "sorry..... This email address alreday exist as a user, Can't be used to register as Admin", status: 400 });
    // } 
    else if (Supermail) {
        res.status(401).json({ msg: "sorry..... You cant invite super admin", status: 401 });
    } else if (admin) {
        res.status(401).json({ msg: "sorry..... This email address is already Invited", status: 401 });
    } else {
        const num = Math.floor(1000000 + Math.random() * 9000000)
        let other = await new OtherModel(req.body)
        await other.save()
        req.body.code = num
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
            subject: 'Invitation',
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
                                                                <span> You have been invited by the management of Mongoro as an admin on the Mongoro app. Kindly click on this link <a href='https://admin.mongoro.com/change-password/%7Bemail%7D'>Click here</a> to get started.
                                                                <br>
                                                                <br>
                                                                If you think this email has been sent to the wrong individual kindly reach out immediately and we will rectify it.</span>
                                                            </p>
                                                            <br>
                                                            
                                                            <p style='margin:2rem 0; color: #292929; line-height: 1.5rem;'>
                                                                <span>Regards,</span>
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
            </html>`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });

        res.status(200).json({ msg: 'Invited successfuly !', status: 200 });
    }

})

router.post("/disable", async (req, res) => {

    const supers = await SuperModel.findOne({ email: req.body.super_email })
    const user = await OtherModel.findOne({ email: req.body.email });

    if (!req.body.email) return res.status(402).json({ msg: 'provide the email ?', status: 402 })

    if (!user) {
        res.status(401).json({ msg: "wrong Email !", status: 401 });
    } else if (!supers) {
        res.status(400).json({
            msg: 'you dont have access ',
            status: 400
        })
    } else {
        await OtherModel.deleteOne({ email: req.body.email })
        res.status(200).json({ msg: 'Disabled successfully ', status: 200 });
    }

})


module.exports = router