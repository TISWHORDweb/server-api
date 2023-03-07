const express = require('express')
const router = express.Router()
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")
const verify = require("../../../verifyToken")
const bcrypt = require('bcryptjs')
let multer = require('multer')
let fs = require('fs')
let path = require('path');
const CryptoJS = require("crypto-js")

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


router.get('/all', paginatedResults(MongoroUserModel), (req, res) => {
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
            const results = await model.find().limit(limit).skip(startIndex).exec()
            let count = await MongoroUserModel.count()
            res.paginatedResults = { action, results, TotalResult: count, Totalpages: Math.ceil(count / limit) }
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}


router.delete("/delete", verify, async (req, res) => {
    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

        await MongoroUserModel.deleteOne({ _id: req.body.id })
        res.status(200).json("User deleted....");
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

});

router.get("/:id", verify, async (req, res) => {
    try {
        if (!req.params.id) return res.status(402).json({ msg: 'provide the id ?' })

        let user = await MongoroUserModel.find({ _id: req.params.id })
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.post("/inactive/:id", async (req, res) => {
    try {
        if (!req.params.id) return res.status(402).json({ msg: 'provide the id ?' })

        await MongoroUserModel.updateOne({ _id: req.params.id }, { $set: { active: false } }).then(() => {
            res.status(200).json({ msg: 'User turned inactive successfully ', status: 200 });
        })

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})


router.put('/edit', verify, async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    let { id } = body;

    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        await MongoroUserModel.updateOne({ _id: id }, body).then(async () => {
            let user = await MongoroUserModel.findOne({ _id: id })
            return res.status(200).json({
                msg: 'Account Setup Successfully ',
                user: user,
                status: 200
            })
        }).catch((err) => {
            res.send(err)
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

})

router.post('/forgot_password', async (req, res) => {

    const user = await MongoroUserModel.findOne({ email: req.body.email });

    try {
        if (!req.body.email) return res.status(400).json({ msg: 'provide the email ?', status: 400 })

        if (!user) {
            res.status(400).json({ msg: "No User is registered with this email", status: 400 });
        }

        const originalPassword = await bcrypt.compare(req.body.password, user.password);

        if (originalPassword === req.body.newPassword) {
            res.status(400).json({ msg: "You cant change your password to your previous password, use another password and try again", status: 400 });
        }

        if (!originalPassword) {
            res.status(400).json({ msg: "wrong password", code: 400 })
        } else {

            const newPassword = await bcrypt.hash(req.body.newpassword, 13)
            await MongoroUserModel.updateOne({ email: req.body.email }, { password: newPassword }).then(async () => {
                const NewPassword = await MongoroUserModel.findOne({ email: req.body.email });
                return res.status(200).json({
                    msg: 'Password changed Successfully ',
                    user: NewPassword,
                    status: 200
                })
            }).catch((err) => {
                res.send(err)
            })

        }

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

})

//PIN
router.post('/create_pin', verify, async (req, res) => {

    console.log(req.body)

    let user = await MongoroUserModel.findOne({ _id: req.body.id })

    if (!req.body.pin) return res.status(402).json({ msg: 'provide the Pin ?' })


    if (user) {

        req.body.pin = CryptoJS.AES.encrypt(req.body.pin, "mongoro").toString()

        await MongoroUserModel.updateOne({ _id: req.body.id }, { pin: req.body.pin }).then(async () => {
            let user = await MongoroUserModel.findOne({ _id: req.body.id })
            return res.status(200).json({
                msg: 'Pin created Successfully ',
                user: user,
                status: 200
            })
        })
    } else {
        res.status(400).json({ msg: "No User is registered with this id!", status: 401 });
    }



})

router.post("/verify_pin", verify, async (req, res) => {

    const user = await MongoroUserModel.findOne({ _id: req.body.id });
    const bytes = CryptoJS.AES.decrypt(user.pin, process.env.SECRET_KEY);
    const originalPin = bytes.toString(CryptoJS.enc.Utf8);

    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        if (originalPin !== req.body.pin) {
            res.status(401).json({ msg: "wrong pin !", status: 401 });
        } else {
            return res.status(200).json({
                msg: 'Account Setup Successfully ',
                status: 200
            })
        }
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.post('/edit_pin', verify, async (req, res) => {

    const user = await MongoroUserModel.findOne({ _id: req.body.id });
    const bytes = CryptoJS.AES.decrypt(user.pin, process.env.SECRET_KEY);
    const originalPin = bytes.toString(CryptoJS.enc.Utf8);

    console.log(originalPin)
    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        if (originalPin !== req.body.pin) {
            res.status(401).json({ msg: "wrong pin !", status: 401 });
        } else {
            const newPin = CryptoJS.AES.encrypt(req.body.new_pin, "mongoro").toString()
            await MongoroUserModel.updateOne({ _id: req.body.id }, { pin: newPin }).then(async () => {
                const Newuser = await MongoroUserModel.findOne({ _id: req.body.id });
                return res.status(200).json({
                    msg: 'Account Setup Successfully ',
                    user: Newuser,
                    status: 200
                })
            }).catch((err) => {
                res.send(err)
            })
        }

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

})

router.put('/image', upload.any(), async (req, res) => {

    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

        await MongoroUserModel.updateOne({ _id: req.body.id }, { $set: { image: req.body.image } }).then(async () => {
            let user = await MongoroUserModel.findOne({ _id: req.body.id })
            return res.status(200).json({

                msg: 'Image Setup Successfully ',
                image: user.image,
                status: 200
            })
        }).catch((err) => {
            res.send(err)
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

})

//unBlock
router.put('/unblock', verify, async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    let { id } = body;
    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        await MongoroUserModel.updateOne({ _id: id }, { $set: { blocked: false } }).then(async () => {
            return res.status(200).json({
                msg: 'unBlocked Successful ',
                status: 200
            })
        }).catch((err) => {
            res.send(err)
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

})

//Block
router.put('/block', verify, async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    let { id } = body;
    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        await MongoroUserModel.updateOne({ _id: id }, { $set: { blocked: true } }).then(async () => {
            return res.status(200).json({
                msg: 'Blocked Successful ',
                status: 200
            })
        }).catch((err) => {
            res.send(err)
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

})

router.get('/state', async (req, res) => {
    console.log(state)
})



module.exports = router
