const express = require('express')
const router = express.Router()
const SuperModel = require("../../../models/mongoro/admin/super_admin/super_md")
const dotenv = require("dotenv")
const GlobalModel = require('../../../models/mongoro/admin/super_admin/global/global_md')
dotenv.config()
const bcrypt = require('bcryptjs')



router.post("/login", async (req, res) => {
    res.header("Access-Control-Allow-Origin", "*");

    const supers = await SuperModel.findOne({ email: req.body.email })
    const superPassword = supers.password

    const admin = GlobalModel.findOne({ email: req.body.email })
    const adminPassword = admin.password

    console.log(adminPassword)

    // const value = users.disable_all_user
    // const user = await MongoroUserModel.findOne({ email: req.body.email })

    // if (!user) {
    //     res.status(400).json({ msg: "user not found", code: 400 })
    // } 
    
    // const resultt = user.blocked

    // if (user.category === "Admin") {
    //     if (resultt === true) {
    //         res.status(403).json({ msg: "Sorry your account is blocked", code: 403 })
    //     } else if (value === true) {
    //         res.status(500).json({ msg: "Sorry service temporarily unavailable", code: 500 })
    //     } else {

    //         const originalPassword = await bcrypt.compare(req.body.password, user.password);

    //         if (!originalPassword) {
    //             res.status(400).json({ msg: "wrong password", code: 400 })
    //         } else {
    //             const accessToken = jwt.sign(
    //                 { id: user._id, isverified: user.isverified },
    //                 process.env.SECRET_KEY,
    //                 { expiresIn: "5h" }
    //             );

    //             const ip = address.ip();

    //             await MongoroUserModel.updateOne({ _id: user._id }, { $set: { ip: ip } }).then(() => {
    //                 res.status(200).json({ msg: 'logged in successfuly Admin !',category:"Admin", user: user, token: accessToken, ip_address: ip, status: 200 });
    //             })
    //         }
    //     }

    // } else if (user.category === "Super Admin") {

    //     if (resultt === true) {
    //         res.status(403).json({ msg: "Sorry your account is blocked", code: 403 })
    //     } else {

    //         const originalPassword = await bcrypt.compare(req.body.password, user.password);

    //         if (!originalPassword) {
    //             res.status(400).json({ msg: "wrong password", code: 400 })
    //         } else {
    //             const accessToken = jwt.sign(
    //                 { id: user._id, isverified: user.isverified },
    //                 process.env.SECRET_KEY,
    //                 { expiresIn: "5h" }
    //             );

    //             const ip = address.ip();

    //             await MongoroUserModel.updateOne({ _id: user._id }, { $set: { ip: ip } }).then(() => {
    //                 res.status(200).json({ msg: 'logged in successfuly Super Admin', category:"Super Admin", user: user, token: accessToken, ip_address: ip, status: 200 });
    //             })
    //         }
    //     }

    // } else {
    //     res.status(403).json({ msg: "Sorry you have No access ", code: 403 })
    // }
})


module.exports = router