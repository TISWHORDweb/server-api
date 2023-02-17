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


//CREATE
router.post('/register', async (req, res) => {

    // function generateRandomLetter() {
    //     return Word[Math.floor(Math.random() * Word.length)]
    // }

    // var middle_name = req.body.middle_name.toLowerCase()
    // var surname = req.body.surname.toLowerCase()
    // var first_name = req.body.first_name.toLowerCase()
    // var strmiddle_name = middle_name.substring(0, 1);
    // var strsurname = surname.substring(0, 1);
    // var strfirst_name = first_name.substring(0, 1);
    // const word = generateRandomLetter().toLowerCase()

    const ref = "@" + req.body.usertag

    req.body.wallet_ID =ref 
    console.log(req.body.wallet_ID)

    if (req.body.password) {
        req.body.password = await bcrypt.hash(req.body.password, 13)
    }

    try {
        if (!req.body.email || !req.body.usertag || !req.body.surname || !req.body.first_name || !req.body.middle_name || !req.body.password || !req.body.phone ) return res.status(402).json({ msg: 'please check the fields ?', status: 402 })

        const validate = await MongoroUserModel.findOne({ wallet_ID: req.body.wallet_ID })
        if (validate) return res.status(404).json({ msg: 'There is another user with this User Tag !', status: 404 })

        const validates = await MongoroUserModel.findOne({ email: req.body.email })
        if (validates) return res.status(404).json({ msg: 'There is another user with this email !', status: 404 })


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

// router.post("/verify", async (req, res) => {
//     try {
//         let sms = await MongoroUserModel.findOne({ sms_code: req.body.sms_code })
//         let email = await MongoroUserModel.findOne({ email_code: req.body.email_code })
//         if (!sms || !email) {
//             res.status(404).json({ msg: "Incorrect verification code press code resend and try again", status: 404 })
//         } else {
//             await MongoroUserModel.update({ isverified: false }, { $set: { isverified: true } })
//             return res.status(200).json({
//                 msg: 'Congratulation you Account is verified !!!',
//                 status: 200
//             })
//         }
//     } catch (error) {
//         res.status(500).json({
//             msg: 'there is an unknown error sorry !',
//             status: 500
//         })
//     }

// })

router.post("/verify", async (req, res) => {
    try {
        email_code = Math.floor(100 + Math.random() * 900)
        sms_code = Math.floor(100 + Math.random() * 900)

        let code = {email_code , sms_code}
        
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
            "sms": "Your code is " + sms_code,
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
            html: `<p> Your code is <h1> ${email_code}</h1></p>`
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
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

})



router.post("/login", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    const user = await MongoroUserModel.findOne({ email: req.body.email })

    if (!user) {
        res.status(400).json({msg:"user not found",code: 400})
    } else{
        const originalPassword = await bcrypt.compare(req.body.password, user.password);

        if(!originalPassword){
            res.status(400).json({msg:"wrong password",code:400})
        }else{
            const accessToken = jwt.sign(
                { id: user._id, isverified: user.isverified },
                process.env.SECRET_KEY,
                { expiresIn: "3h" }
            );
    
            const ip = address.ip();
    
            await MongoroUserModel.updateOne({ _id: user._id }, { $set: { ip: ip } }).then(() => {
                res.status(200).json({ msg: 'logged in successfuly !', user: user, token: accessToken, ip_address: ip, status: 200 });
            })
        }
    }

})


//LOGIN
router.post("/checkdetail", async (req, res) => {

    const user = await MongoroUserModel.findOne({ email: req.body.email });

if(!user){
    return res.status(404).json({ msg: 'invalid email', status: 404 })
}else{
    const originalPassword = await bcrypt.compare(req.body.password, user.password);

    if(!originalPassword){
        return res.status(400).json({ msg: 'wrong password!'})
    }else{
        return res.status(200).json({ msg: 'logged in successfuly!',})
    }

}

// else if(!originalPassword){
//     return res.status(404).json({ msg: 'invalid password!', status: 404 })
// }
    // if (!user) return res.status(404).json({ msg: 'invalid email', status: 404 })
    // if (user && user.password !== req.body.password) return res.status(404).json({ msg: 'invalid password!', status: 404 })

})

//setup
router.put('/settings', async (req, res) => {
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
