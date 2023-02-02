const express = require('express')
const router = express.Router()
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")
const verify = require("../../../verifyToken")
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


router.get("/all", async (req, res) => {
    try {
        const user = await MongoroUserModel.find();
        res.status(200).json(user.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.delete("/delete", verify, async (req, res) => {
    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' })

        await MongoroUserModel.deleteOne({ _id: req.body.id })
        res.status(200).json("User deleted....");
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

});

router.get("/single", verify, async (req, res) => {
    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' })

        let user = await MongoroUserModel.find({ _id: req.body.id })
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


router.put('/edit', verify, async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    let { id } = body;

    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' ,status: 402})

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

router.put('/edit_password', verify, async (req, res) => {

    const user = await MongoroUserModel.findOne({ _id: req.body.id });
    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' ,status: 402})

        if(originalPassword != req.body.password){
            res.status(401).json({msg: "wrong password !", status: 401});
        }else{
            const newPassword = CryptoJS.AES.encrypt(req.body.new_password, "mongoro").toString()
            await MongoroUserModel.updateOne({ _id: req.body.id }, {password: newPassword}).then(async () => {
                const Newuser = await MongoroUserModel.findOne({ _id: req.body.id });
                return res.status(200).json({
                    msg: 'Account Setup Successfully !!!',
                    user: Newuser,
                    status: 200
                })
            }).catch((err) => {
                res.send(err)
            })
        }
     
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }


})

//PIN
router.put('/create_pin', verify, async (req, res) => {

    if (req.body.pin) {
        req.body.pin = CryptoJS.AES.encrypt(req.body.pin, "mongoro").toString()
    }

    let body = JSON.parse(JSON.stringify(req.body));
    let { id } = body;

    try {
        if (!req.body.pin ) return res.status(402).json({ msg: 'provide the Pin ?' })

        await MongoroUserModel.updateOne({ _id: id }, body).then(async () => {
            let user = await MongoroUserModel.findOne({ _id: id })
            return res.status(200).json({
                msg: 'Pin created Successfully !!!',
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

router.get("/user_pin", verify, async (req, res) => {
    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?',status: 402 })

        let user = await MongoroUserModel.find({ _id: req.body.id })
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.put('/edit_pin', verify, async (req, res) => {

    const user = await MongoroUserModel.findOne({ _id: req.body.id });
    const bytes = CryptoJS.AES.decrypt(user.pin, process.env.SECRET_KEY);
    const originalPin = bytes.toString(CryptoJS.enc.Utf8);

    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?',status: 402 })

        if(originalPin!= req.body.pin){
            res.status(401).json({msg: "wrong password !",status: 401});
        }else{
            const newPin = CryptoJS.AES.encrypt(req.body.new_pin, "mongoro").toString()
            await MongoroUserModel.updateOne({ _id: req.body.id }, {pin: newPin}).then(async () => {
                const Newuser = await MongoroUserModel.findOne({ _id: req.body.id });
                return res.status(200).json({
                    msg: 'Account Setup Successfully !!!',
                    user: Newuser,
                    status: 200
                })
            }).catch((err) => {
                res.send(err)
            })
        }
     
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

})

router.put('/image', verify, upload.any(), async (req, res) => {
    // let body = JSON.parse(JSON.stringify(req.body));
    // let { id } = body;

    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' })
        let user = await new MongoroUserModel(req.body)


        req.files.map(e => {
            switch (e.fieldname) {
                case "image":
                    user.image = e.filename
                    break;
            }
        })

        const image = user.image

        await MongoroUserModel.updateOne({ _id: req.body.id }, {image: user.image}).then(async () => {
            let user = await MongoroUserModel.findOne({ _id: req.body.id })
            return res.status(200).json({
                msg: 'Image Setup Successfully !!!',
                image: user.image,
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

