const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer');
const ReefWaitlistModel = require("../../../models/reef/reefWaitlist_md")
const verify = require("../../../verifyToken")

// CREATE
router.post('/create', async (req, res) => {
    console.log(req.body)
    try {
        if (!req.body.email) return res.status(402).json({ msg: 'please check the fields ?',status: 402 })

        const validate = await ReefWaitlistModel.findOne({ email: req.body.email })
        if (validate) return res.status(404).json({ msg: 'There is another user with this email !',status: 401 })

       
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
            subject: 'Welcome Onboard',
            html: `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta http-equiv="X-UA-Compatible" content="IE=edge">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Reef</title>
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
                                    <div style='padding: 1rem; background: #F7FAFE;'>
                                        <img 
                                            style='width: 5rem; display: block; margin: 0 auto'
                                            src='http://res.cloudinary.com/dszrk3lcz/image/upload/v1674126541/pmej6d15nla5v5sbzlpt.webp' 
                                            alt=''
                                        />
                                    </div>
                                    
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
                                                        <h3 class="header" style='color: #161616'>Dear, @${req.body.email}</h3>
                                                        <p style='margin:2rem 0; color: #161616; line-height: 1.5rem;'>
                                                            Thanks so much for reaching out! We look forward to getting back to you as soon as we begin to roll out our products targeted at expanding your business payment options and security.
                                                            <br>
                                                            <br>
                                                            <p style='margin:2rem 0; color: #161616; line-height: 1.5rem;'>
                                                                <span><b>Reef Financial Solutions Limited Team</b></span>
                                                            </p>
                                                            <hr 
                                                                style='border: none; border-bottom: 0.6px solid #6297ee'
                                                            />
                                                            <p style='color: #666666; text-align: center; font-size: 14px; margin: 2rem 0 0 0'>+2348033550170</p>
                                                            <p style='color: #666666; text-align: center; font-size: 14px;'>sales@reeflimited.com</p>
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

        let user = await new ReefWaitlistModel(req.body)
        await user.save().then(user => {
            return res.status(200).json({
                msg: 'Congratulation you just join our Waitlist!!! !',
                status: 200,
                user: {
                    id: user.id,
                    email: user.email,
                    time_created: user.time_created
                },
            })
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }


})

// GET ALL
router.get('/all', verify, paginatedResults(ReefWaitlistModel), (req, res) => {
    res.json(res.paginatedResults)
})

function paginatedResults(model) {
    return async (req, res, next) => {
        const page = parseInt(req.query.page)
        const limit = parseInt(req.query.limit)

        const startIndex = (page - 1) * limit
        const endIndex = page * limit

        const results = {}

        if (endIndex < await model.countDocuments().exec()) {
            results.next = {
                page: page + 1,
                limit: limit
            }
        }

        if (startIndex > 0) {
            results.previous = {
                page: page - 1,
                limit: limit
            }
        }
        try {
            results.results = await model.find().limit(limit).skip(startIndex).exec()
            let count = await ReefWaitlistModel.count()
            res.paginatedResults = {results, TotalResult: count, Totalpages: Math.ceil(count / limit)}
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

// DELETE
router.delete("/delete", verify, async (req, res) =>{
    try{
        await ReefWaitlistModel.findByIdAndDelete({_id:req.body.id});
        res.status(200).json({msg:"waitlists deleted....",status: 200});
    }catch(err){
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
});


//GET BY ID
router.get("/find",verify,async (req,res)=>{
try{
    let waitlist=await ReefWaitlistModel.find({_id:req.body.id})
    res.status(200).json(waitlist);
}catch(err){
    res.status(500).json({
        msg: 'there is an unknown error sorry !',
        status: 500
    })
}
})


module.exports = router