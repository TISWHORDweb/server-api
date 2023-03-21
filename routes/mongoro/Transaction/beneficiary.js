const express = require('express')
const router = express.Router()
const BeneficiaryModel = require("../../../models/mongoro/transaction/beneficiary")
const verify = require("../../../verifyToken")


router.get('/all', paginatedResults(BeneficiaryModel), (req, res) => {
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
            let count = await BeneficiaryModel.count()
            res.paginatedResults = {action, results ,TotalResult: count, Totalpages: Math.ceil(count / limit)}
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

//CREATE
router.post('/create', async (req, res) => {

    if (!req.body.userId ) return res.status(402).json({ msg: 'please check the fields ?' })

    if(req.body.usertag){
    req.body.wallet_ID = req.body.usertag
    }
    // try {
        // const validate = await Mpos.findOne({ business_name: req.body.business_name })
        // if (validate) return res.status(404).json({ msg: 'This Business name is already picked !',status: 404 })

        let user = await new BeneficiaryModel(req.body)

        await user.save().then(user => {
            return res.status(200).json({
                msg: 'Beneficiary created successful ',
                user: user,
                status: 200
            })
        })

    // } catch (error) {
    //     res.status(500).json({
    //         msg: 'there is an unknown error sorry !',
    //         status: 500
    //     })
    // }
})

router.delete("/delete", async (req, res) => {
    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' })

        await BeneficiaryModel.deleteOne({ _id: req.body.id })
        res.status(200).json({msg:"Request deleted....",status: 200});
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

});

router.get("/user/:id",  async (req, res) => {
    try {
        if (!req.params.id ) return res.status(402).json({ msg: 'provide the id ?',status: 402 })

        let beneficiary = await BeneficiaryModel.find({ userId: req.params.id })
        res.status(200).json(beneficiary);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.get("/:id",  async (req, res) => {
    try {
        if (!req.params.id ) return res.status(402).json({ msg: 'provide the id ?',status: 402 })

        let beneficiary = await BeneficiaryModel.find({ _id: req.params.id })
        res.status(200).json(beneficiary);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.put('/edit',  async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    let { id } = body;

    // const validate = await Mpos.findOne({ business_name: req.body.business_name })
    // if (validate) return res.status(404).json({ msg: 'This Business name is already picked !',status: 404 })

    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?',status: 402 })

        await BeneficiaryModel.updateOne({ _id: id }, body).then(async () => {
            let user = await BeneficiaryModel.findOne({ _id: id })
            return res.status(200).json({
                msg: 'Beneficiary Setup Successfully ',
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



module.exports = router

