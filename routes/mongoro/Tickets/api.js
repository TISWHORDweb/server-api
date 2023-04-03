const express = require('express')
const router = express.Router()
const TicketModel = require("../../../models/mongoro/tickets/api")
const verify = require("../../../verifyToken")
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")

router.get('/all', verify, paginatedResults(TicketModel), (req, res) => {
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
            let count = await TicketModel.count()
            res.paginatedResults = { action, results, TotalResult: count, Totalpages: Math.ceil(count / limit) }
            next()
        } catch (e) {
            res.status(500).json({ message: e.message })
        }
    }
}

//CREATE
router.post('/create', verify, async (req, res) => {

    req.body.ticketID = "0001" + Math.floor(1000 + Math.random() * 9000)

    if ( !req.body.subject || !req.body.name) return res.status(402).json({ msg: 'please check the fields' })

    try {

        let tickets = await new TicketModel(req.body)

        await tickets.save().then(tickets => {
            return res.status(200).json({
                msg: 'Ticket created successful ',
                tickets: tickets,
                status: 200
            })
        })
        // const user = await MongoroUserModel.findOne({ wallet_ID: req.body.username })
        // if (user) {
        //     req.body.image = user.image
        //     req.body.email = user.email
        //     req.body.name = user.surname + " " + user.first_name

        //     let tickets = await new TicketModel(req.body)

        //     await tickets.save().then(tickets => {
        //         return res.status(200).json({
        //             msg: 'Ticket created successful ',
        //             tickets: tickets,
        //             status: 200
    
        //         })
        //     })
        // }
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})


router.delete("/delete", verify, async (req, res) => {
    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

        await TicketModel.deleteOne({ _id: req.body.id })
        res.status(200).json("Tickets deleted....");
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

        let tickets = await TicketModel.find({ _id: req.params.id })
        res.status(200).json(tickets);
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
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

        await TicketModel.updateOne({ _id: id }, body).then(async () => {
            let tickets = await TicketModel.findOne({ _id: id })
            return res.status(200).json({
                msg: 'Ticket Edited Successfully ',
                tickets: tickets,
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

