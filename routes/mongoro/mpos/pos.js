const express = require('express')
const router = express.Router()
const Mpos = require("../../../models/mongoro/mpos/mpos_md")
const verify = require("../../../verifyToken")


router.get('/all', verify, paginatedResults(Mpos), (req, res) => {
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
            let count = await Mpos.count()
            res.paginatedResults = {action, results ,TotalResult: count, Totalpages: Math.ceil(count / limit)}
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

//CREATE
router.post('/request', verify,async (req, res) => {

    if (!req.body.business_name || !req.body.phone || !req.body.quantity || !req.body.address || !req.body.state || !req.body.city || !req.body.country) return res.status(402).json({ msg: 'please check the fields ?' })

    try {
        const validate = await Mpos.findOne({ business_name: req.body.business_name })
        if (validate) return res.status(404).json({ msg: 'This Business name is already picked !',status: 404 })

        let user = await new Mpos(req.body)

        await user.save().then(user => {
            return res.status(200).json({
                msg: 'Congratulation Your request is successful !!!',
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


router.delete("/delete", verify, async (req, res) => {
    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' })

        await Mpos.deleteOne({ _id: req.body.id })
        res.status(200).json({msg:"Request deleted....",status: 200});
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

});

router.get("/:id", verify, async (req, res) => {
    try {
        if (!req.params.id ) return res.status(402).json({ msg: 'provide the id ?',status: 402 })

        let pos = await Mpos.find({ _id: req.params.id })
        res.status(200).json(pos);
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

    const validate = await Mpos.findOne({ business_name: req.body.business_name })
    if (validate) return res.status(404).json({ msg: 'This Business name is already picked !',status: 404 })

    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?',status: 402 })

        await Mpos.updateOne({ _id: id }, body).then(async () => {
            let user = await Mpos.findOne({ _id: id })
            return res.status(200).json({
                msg: 'Pos request Setup Successfully !!!',
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

