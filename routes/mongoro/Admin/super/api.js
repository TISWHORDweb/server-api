const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer');
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")
const CryptoJS = require("crypto-js")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv")
dotenv.config()
const verify = require("../../../verifyToken")

let multer = require('multer')
let fs = require('fs')
let path = require('path');

//Configure Storage
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let __dir = path.join(__dirname, "../../../public/uploads")
        cb(null, __dir)
    }, filename: function (req, file, cb) {
        let fileName = file.originalname.toLowerCase()
        cb(null, fileName)
    }
})

//set Storage Configuration to multer
let upload = multer({ storage })


//CREATE
router.post('/register', async (req, res) => {

    req.body.email_code = Math.floor(100000 + Math.random() * 900000)
    req.body._code = Math.floor(100000 + Math.random() * 900000)

    try {
        if (!req.body.email || !req.body.phone ) return res.status(402).json({ msg: 'please check the fields ?' })

        const validate = await MongoroUserModel.findOne({ email: req.body.email })
        if (validate) return res.status(404).json({ msg: 'There is another user with this email !' })


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
                                <a>
                                    <img 
                                        style='width: 5rem; display: block; margin: 0 auto'
                                        src='http://res.cloudinary.com/dszrk3lcz/image/upload/v1674128779/jx0ptubgqjuuj8dran8e.webp' 
                                        alt=''
                                    />
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td>
                                <table width=100% class=sub-main>
                                    <tr>
                                        <td>
                                            <table width=100%>
                                                <tr>
                                                    <td>
                                                        <h1 class="header" style='color: #161616'>Hi, ${req.body.verification_code}</h1>
                                                        <p style='margin:2rem 0; color: #161616; line-height: 1.5rem;'>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Quo velit architecto aliquid veritatis nulla reiciendis culpa, eligendi consectetur amet necessitatibus doloremque totam facere sequi, corrupti, id exercitationem dolorum inventore earum? 
                                                            <br>
                                                            <br>
                                                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus, ab! Praesentium maiores nisi consectetur repellat sapiente temporibus natus cum veniam. Qui nulla, perferendis animi maxime assumenda ad libero doloremque suscipit?</p>
            
                                                            <p style='margin:2rem 0; color: #161616; line-height: 1.5rem;'>
                                                                <span>Need some help getting set up, book a session with one of our people.</span>
                                                            </p>
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



        let user = await new MongoroUserModel(req.body)

        await user.save().then(user => {
            return res.status(200).json({
                msg: 'Congratulation you just Created your Mongoro Account !!!',
                user: user
            })
        })


    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }


})



module.exports = router
