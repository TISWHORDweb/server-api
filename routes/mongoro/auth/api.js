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


//CREATE
router.post('/register', async (req, res) => {

    function generateRandomLetter() {
        return Word[Math.floor(Math.random() * Word.length)]
    }


    var str = req.body.name;
    var strFirstThree = str.substring(0, 3);
    const word = generateRandomLetter()

    const ref = "@"+strFirstThree+word+Math.floor(100 + Math.random() * 999)

    req.body.email_code = Math.floor(100 + Math.random() * 900)
    req.body.sms_code = Math.floor(100 + Math.random() * 900)
    req.body.wallet = { wallet_ID: ref }

    if (req.body.password) {
        req.body.password = CryptoJS.AES.encrypt(req.body.password, "mongoro").toString()
    }

    try {
        if (!req.body.email || !req.body.name || !req.body.password || !req.body.phone || !req.body.username) return res.status(402).json({ msg: 'please check the fields ?', status: 402 })

        const validate = await MongoroUserModel.findOne({ email: req.body.email })
        if (validate) return res.status(404).json({ msg: 'There is another user with this email !', status: 404 })

        const validator = await MongoroUserModel.findOne({ username: req.body.username })
        if (validator) return res.status(404).json({ msg: 'There is another user with this username !', status: 404 })

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
            "sms": "Your code is "+req.body.sms_code,
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
                                                        <h1 class="header" style='color: #161616'>Hi, ${req.body.email_code}</h1>
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
                user: user,
                status: 200
            })
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
        let sms = await MongoroUserModel.findOne({ sms_code: req.body.sms_code })
        let email = await MongoroUserModel.findOne({ email_code: req.body.email_code })
        if (!sms ||!email) {
            res.status(404).json({ msg: "Incorrect verification code press code resend and try again", status: 404 })
        } else {
            await MongoroUserModel.update({ isverified: false }, { $set: { isverified: true } })
            return res.status(200).json({
                msg: 'Congratulation you Account is verified !!!',
                status: 200
            })
        }
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

})


//LOGIN
router.post("/login", async (req, res) => {

    const user = await MongoroUserModel.findOne({ email: req.body.email });
    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    const validator = await MongoroUserModel.findOne({ username: req.body.username })
    if (validator) return res.status(404).json({ msg: 'There is another user with this username !', status: 404 })


    if (user === null) {
        console.log("User does not exists");
        res.status(200).json("wrong password or username !");
    } else if (originalPassword != req.body.password) {
        res.status(200).json({ msg: 'wrong password !', status: 200 });
    } else {
        const accessToken = jwt.sign(
            { id: user._id, isverified: user.isverified },
            process.env.SECRET_KEY,
            { expiresIn: "3h" }
        );

        const ip = address.ip();

        await MongoroUserModel.updateOne({ _id: user._id }, { $set: { ip: ip } })

        res.status(200).json({ msg: 'logged in successfuly !', user: user, token: accessToken, ip_address: ip, status: 200 });
    }

})

//setup
router.put('/settings', verify, async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    console.log(body)
    let { id } = body;
    console.log(id)

    try {
        if (!req.body.address || !req.body.purpose || !req.body.country || !req.body.state || !req.body.city || !req.body.gender || !req.body.occupation) return res.status(402).json({ msg: 'please check the fields ?' })

        await MongoroUserModel.updateOne({ _id: id }, body).then(async () => {
            let user = await MongoroUserModel.findOne({ _id: id })
            return res.status(200).json({
                msg: 'Account Setup Successfully !!!',
                user: user,
                status: 200
            })
        }).catch((err) => {
            res.send(err)
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

})

module.exports = router
