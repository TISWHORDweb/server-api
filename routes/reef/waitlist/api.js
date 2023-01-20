const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer');
const ReefWaitlistModel = require("../../../models/reef/reefWaitlist_md")
const emailValidator = require("email-validator")

router.post('/create', async (req, res) => {
    console.log(req.body)
    try {
        if (!req.body.email || !emailValidator.validate(req.body.email)) return res.status(402).json({ msg: 'please check the fields Invalid Emails?' })

        const validate = await ReefWaitlistModel.findOne({ email: req.body.email })
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
                                        src='https://reeflimited.slack.com/archives/C017J2YQJTA/p1674128854181129?thread_ts=1674127457.421849&cid=C017J2YQJTA' 
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
                                                        <h3 class="header" style='color: #161616'>Hi, ${req.body.name}</h3>
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

        let user = await new ReefWaitlistModel(req.body)
        await user.save().then(user => {
            return res.status(200).json({
                msg: 'Congratulation you just join our Waitlist!!! !',
                user: {
                    id: user.id,
                    email: user.email,
                    time_created: user.time_created
                },
            })
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }


})

router.get("/get", async (req, res) =>{
    try {
        const waitlist = await ReefWaitlistModel.find();
        res.status(200).json(waitlist.reverse());
    } catch (err) {
        res.status(500).json(err);
    }
})


router.delete("/waitlists/:id", async (req, res) =>{
    try{
        await ReefWaitlistModel.findByIdAndDelete(req.params.id);
        res.status(200).json("waitlists deleted....");
    }catch(err){
        res.status(500).json(err);
    }
});


//GET
router.get("/waitlists/:id",async (req,res)=>{
try{
    let waitlist=await ReefWaitlistModel.find({_id:req.params.id})
    res.status(200).json(waitlist);
}catch(err){
    res.status(500).json(err);
}
})


module.exports = router