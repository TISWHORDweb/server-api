const express = require('express')
const router = express.Router()
const TicketModel = require("../../../models/mongoro/tickets/api")
const verify = require("../../../verifyToken")

router.get("/all", verify, async (req, res) => {
    try {
        const tickets = await TicketModel.find();
        res.status(200).json(tickets.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }
})

//CREATE
router.post('/create', verify,async (req, res) => {

    req.body.ID = "0012"+Math.floor(1000 + Math.random() * 9000)

    if (!req.body.username || !req.body.option || !req.body.amount || !req.body.method || !req.body.status || !req.body.description ) return res.status(402).json({ msg: 'please check the fields ?' })

    try {
        let tickets = await new TicketModel(req.body)

        await tickets.save().then(tickets => {
            return res.status(200).json({
                msg: 'Ticket created successful !!!',
                tickets: tickets
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

        await TicketModel.deleteOne({ _id: req.body.id })
        res.status(200).json("Tickets deleted....");
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }

});

router.get("/single", verify, async (req, res) => {
    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' })

        let tickets = await TicketModel.find({ _id: req.body.id })
        res.status(200).json(tickets);
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !'
        })
    }
})

router.put('/edit', verify, async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    let { id } = body;

    try {
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' })

        await TicketModel.updateOne({ _id: id }, body).then(async () => {
            let tickets = await TicketModel.findOne({ _id: id })
            return res.status(200).json({
                msg: 'Ticket Edited Successfully !!!',
                tickets: tickets
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

