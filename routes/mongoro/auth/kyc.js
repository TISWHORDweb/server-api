const express = require('express')
const router = express.Router()
const nodemailer = require('nodemailer');
const KycModel = require("../../../models/mongoro/kyc/kyc_md")
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")
const verify = require("../../../verifyToken")
const bcrypt = require('bcryptjs')
const axios = require("axios")


//KYC
router.post('/', async (req, res) => {

    try {

        if (!req.body.userId) return res.status(400).json({ msg: 'provide the id' })

        let details = new KycModel(req.body)
        details.save().then(()=>{
            
        })

        await MongoroUserModel.updateOne({ _id: req.body.userId }, {  id_doc: 1  }).then(() => {
            return res.send(details)
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'There is an unknown error sorry.... Please contact our support !',
            status: 500
        })
    }
})


router.post('/accept', async (req, res) => {

    try {
        if (!req.body.userId) return res.status(400).json({ msg: 'provide the id' })

        await MongoroUserModel.updateOne({ _id: req.body.userId }, { id_doc: 2 , tiers: "two" }).then(() => {
            return res.status(200).json({ msg: 'Accepted', status:'200' })
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'There is an unknown error sorry.... Please contact our support !',
            status: 500
        })
    }
})


router.post('/reject', async (req, res) => {

    try {
        if (!req.body.userId) return res.status(400).json({ msg: 'provide the id' })

        await MongoroUserModel.updateOne({ _id: req.body.userId }, { id_doc: 3 }).then(() => {
            return res.status(202).json({ msg: 'Rejected', status:'202' })
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            msg: 'There is an unknown error sorry.... Please contact our support !',
            status: 500
        })
    }
})


router.get("/all", async (req, res) => {
    try {
        const kyc = await KycModel.find();
        res.status(200).json(kyc.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.get("/user/:id", async (req, res) => {
    try {

        const kyc = await KycModel.find({ userId: req.params.id });

        res.status(200).json(kyc);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.get("/type/:id", async (req, res) => {
    try {

        const kyc = await KycModel.find({ type: req.params.id });

        res.status(200).json(kyc);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})


router.delete("/delete", async (req, res) => {
    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

        await KycModel.deleteOne({ _id: req.body.id })
        res.status(200).json({ msg: "KYC deleted....", status: 200 });
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

});


module.exports = router