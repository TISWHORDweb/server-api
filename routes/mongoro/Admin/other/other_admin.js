const express = require('express')
const router = express.Router()
const OtherModel = require('../../../../models/mongoro/admin/other/otherAdmi_md')
const SuperModel = require('../../../../models/mongoro/admin/super_admin/super_md')
const CategoryModel = require("../../../../models/mongoro/admin/super_admin/category/category")
const dotenv = require("dotenv")
dotenv.config()
const bcrypt = require('bcryptjs')


router.get("/all", async (req, res) => {
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


router.post("/check", async (req, res) => {

    const user = await OtherModel.findOne({ email: req.body.email });

    if (!req.body.email) return res.status(402).json({ msg: 'provide the email ?', status: 402 })

    if (!user) {
        res.status(401).json({ msg: "wrong Email or you are not invited yet !", status: 401 });
    } else {
        let admin = new OtherModel(req.body)
        admin.save()
        await OtherModel.updateOne({ email: req.body.email }, { $set: { isverified: true } })
        res.status(200).json({ msg: 'Verified successfully ', status: 200 });
    }

})

router.post('/password', async (req, res) => {

    try {

        const supers = await OtherModel.findOne({ email: req.body.email })
        
        if (!req.body.email) return res.status(401).json({ msg: 'provide the email ?' })

        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 13)
        }    

        if(supers){
            await OtherModel.updateOne({ email: req.body.email }, { $set: { password: req.body.password } }).then(async () => {
                let other_admin = await OtherModel.findOne({ email: req.body.email })
                return res.status(200).json({
                    msg: 'Password created Successfully ',
                    other:other_admin,
                    status: 200
                })
            }).catch((err) => {
                res.send(err)
            })
        }else{
            res.status(400).json({
                msg: 'you dont have access or invalid email ',
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

module.exports = router