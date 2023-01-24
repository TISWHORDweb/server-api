const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer');
const MongoroRegiserModel = require("../../../models/mongoro/auth/mongoroRegister_md")
const CryptoJS = require("crypto-js")


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
router.post('/register', upload.any(), async (req, res) => {
    // CryptoJS.AES.encrypt(req.body.password, process.env.SECRET_KEY).toString(),
   
    req.body.verification_code = Math.floor(100000 + Math.random() * 900000)

    if(req.body.password){
        req.body.password = CryptoJS.AES.encrypt(req.body.password, "mongoro").toString()
    }

    try {
        if (!req.body.email || !req.body.first_name || !req.body.last_name || !req.body.phone || !req.body.address || !req.body.username || !req.body.password) return res.status(402).json({ msg: 'please check the fields ?' })

        const validate = await MongoroRegiserModel.findOne({ email: req.body.email })
        if (validate) return res.status(404).json({ msg: 'There is another user with this email !' })


        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'ebatimehin@gmail.com',
                pass: 'ojjovobpnmyozynb'
            }
        });

        let mailOptions = {
            from: 'ebatimehin@gmail.com',
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


        
    let user = await new MongoroRegiserModel(req.body)

    req.files.map(e => {
        switch (e.fieldname) {
            case "image":
                user.image = e.filename
                break;
        }
    })
    await user.save().then(user => {
        console.log("user")
        return res.status(200).json({
            msg: 'Congratulation you just Created your Mongoro Account !!!',
            user: {
                id: user.id,
                username: req.body.username,
                email: req.body.email,
                first_name: req.body.first_name,
                last_name: req.body.last_name,
                address: req.body.address,
                phone: req.body.phone,
                password: req.body.password,
                verification_code: req.body.verification_code,
                time_created: user.time_created,
                image: req.body.image,
                isverified: req.body.isverified
            },
        })
        })


    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }


})

router.post("/verify", async (req,res)=>{
    console.log(req.body)
    try {
        let user= await MongoroRegiserModel.findOne({email: req.body.email})
        if(user==null){
            res.status(402).json({ msg: 'The email you input does not exists please check the fields ?' })
        }else if(user.verification_code !=req.body.verification_code){
            res.status(404).json({ msg: "Incorrect verification code press code resend and try again" })
            
        }else{
            await MongoroRegiserModel.updateOne({isverified:false},{$set:{isverified:true}})
            return res.status(200).json({
                msg: 'Congratulation you Account is verified !!!',
            })
           
        }
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }

})

module.exports = router
