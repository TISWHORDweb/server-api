const express = require('express')
const router = express.Router()
const Mpos = require("../../../models/mongoro/mpos/mpos_md")
const verify = require("../../../verifyToken")

router.get("/all", verify, async (req, res) => {
    try {
        const user = await Mpos.find();
        res.status(200).json(user.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }
})

//CREATE
router.post('/request', verify,async (req, res) => {

    if (!req.body.business_name || !req.body.owner_name || !req.body.phone || !req.body.quantity || !req.body.address || !req.body.state || !req.body.city || !req.body.country) return res.status(402).json({ msg: 'please check the fields ?' })

    try {
        const validate = await Mpos.findOne({ business_name: req.body.business_name })
        if (validate) return res.status(404).json({ msg: 'This Business name is already picked !' })

        let user = await new Mpos(req.body)

        await user.save().then(user => {
            return res.status(200).json({
                msg: 'Congratulation Your request is successful !!!',
                user: user
            })
        })


    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }
})


router.delete("/delete", verify, async (req, res) => {
    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' })

        await Mpos.deleteOne({ _id: req.body.id })
        res.status(200).json("Request deleted....");
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }

});

router.get("/single", verify, async (req, res) => {
    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' })

        let user = await Mpos.find({ _id: req.body.id })
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }
})


router.put('/edit', verify, async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    let { id } = body;

    const validate = await Mpos.findOne({ business_name: req.body.business_name })
    if (validate) return res.status(404).json({ msg: 'This Business name is already picked !' })

    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' })

        await Mpos.updateOne({ _id: id }, body).then(async () => {
            let user = await Mpos.findOne({ _id: id })
            return res.status(200).json({
                msg: 'Pos request Setup Successfully !!!',
                user: user
            })
        }).catch((err) => {
            res.send(err)
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }


})



module.exports = router

