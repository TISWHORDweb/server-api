const express = require('express')
const router = express.Router()
const NotificationModel = require("../../../models/mongoro/notification/notification_md")
const verify = require("../../../verifyToken")
const MongoroUserModel = require("../../../models/mongoro/auth/mongoroUser_md")
const {notify} = require("../../../core/core.utils");

router.get('/all', verify, paginatedResults(NotificationModel), (req, res) => {
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
            const results = await (await model.find().sort({_id: -1}).limit(limit).skip(startIndex).exec()).reverse()
            let count = await NotificationModel.count()
            res.paginatedResults = {action, results, TotalResult: count, Totalpages: Math.ceil(count / limit)}
            next()
        } catch (e) {
            res.status(500).json({message: e.message})
        }
    }
}


//Get All Belonging to User
router.get('/all/:id',  async (req, res) => {
    try {
        if (!req.params.id) return res.status(402).json({msg: "provide the id ?"})

        let notifications = await NotificationModel.find({userId: req.params.id})
        res.status(200).json({notifications: notifications?.reverse(), total: notifications?.length});
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            error: err.message,
            status: 500
        })
    }
})

//Get Read Notifications
router.get('/read/:id',verify, async (req, res) => {
    try {
        if (!req.params.id) return res.status(402).json({msg: "provide the id ?"})

        let notifications = await NotificationModel.find({userId: req.params.id, status: 1})
        res.status(200).json({notification: notifications?.reverse(), total: notifications?.length});
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            error: err.message,
            status: 500
        })
    }
})

//Get Unread Notifications
router.get('/unread/:id', verify, async (req, res) => {
    try {
        if (!req.params.id) return res.status(402).json({msg: "provide the id!"})

        let notifications = await NotificationModel.find({userId: req.params.id, status: 0})
        res.status(200).json({notifications: notifications?.reverse(), total: notifications?.length});
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            error: err.message,
            status: 500
        })
    }
})

//Get Single notification and change status from 0 to 1
router.get("/:id", verify,async (req, res) => {
    try {
        if (!req.params.id) return res.status(402).json({msg: 'provide the id ?'})
        await NotificationModel.updateOne({_id: req.params.id}, {status: 1}).then(async () => {
            let notification = await NotificationModel.find({_id: req.params.id})
            return res.status(200).json({
                msg: 'Notification Read Successfully ',
                notification: notification,
                status: 200
            })
        }).catch((err) => {
            res.send(err)
        })

    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

//CREATE
router.post('/create', verify, async (req, res) => {


    if (!req.body.username) return res.status(402).json({msg: 'please check the fields'})

    try {
        const user = await MongoroUserModel.findOne({wallet_ID: req.body.username})
        if (user) {
            req.body.userId = user._id
            req.body.to = user.username

            let notification = await new NotificationModel(req.body)

            await notification.save().then(notification => {
                return res.status(200).json({
                    msg: 'Notification created successful ',
                    notification: notification,
                    status: 200
                })
            })
        }
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})
router.post('/test', async (req, res) => {
    let note = {
        title: "Hi",
        body: `Welcome to Mongoro`
    };

    let data = 'channelId'

    try {
        let notification = notify('id', note.title, note.body, data)
        return res.status(200).json({
            msg: 'Notification created successful ',
            notification: notification,
            status: 200
        })
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.delete("/delete", verify, async (req, res) => {
    try {
        if (!req.body.id) return res.status(402).json({msg: 'provide the id ?'})

        await NotificationModel.deleteOne({_id: req.body.id})
        res.status(200).json("Notification deleted....");
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

});

router.put('/edit', verify, async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    let {id} = body;

    try {
        if (!req.body.id) return res.status(402).json({msg: 'provide the id ?'})

        await NotificationModel.updateOne({_id: id}, body).then(async () => {
            let notification = await NotificationModel.findOne({_id: id})
            return res.status(200).json({
                msg: 'Notification Edited Successfully ',
                notification: notification,
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

