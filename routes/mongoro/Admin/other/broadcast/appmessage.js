const express = require('express')
const router = express.Router()
const BroadcastModel = require("../../../../../models/mongoro/admin/other/broadcast/appmessage")
const dotenv = require("dotenv")
const MongoroUserModel = require("../../../../../models/mongoro/auth/mongoroUser_md")
dotenv.config()


//NOTIFICATION
router.post('/notification/email', async (req, res) => {

    try {
        if (!req.body.recipent || !req.body.message || !req.body.type) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let notification = await new BroadcastModel(req.body)

        await notification.save().then(notification => {
            MongoroUserModel.updateOne({ email: req.body.recipent }, { $set: { notification: { message: req.body.message, subject: req.body.subject, send_at: Date.now() } } }).then(async () => {
            })
            return res.status(200).json({
                msg: 'Notification sent successful ',
                notification: notification,
                status: 200
            })
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})


router.post('/notification', async (req, res) => {

    try {
        if (!req.body.recipent || !req.body.message || !req.body.type) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let notification = await new BroadcastModel(req.body)

        await notification.save().then(notification => {
            MongoroUserModel.updateMany({ blocked: false }, { $set: { notification: { message: req.body.message, subject: req.body.subject, send_at: Date.now() } } }).then(async () => {
            })
            return res.status(200).json({
                msg: 'Notification sent successful',
                notification: notification,
                status: 200
            })
        })
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.post('/notification/state', async (req, res) => {

    try {
        if (!req.body.recipent || !req.body.message || !req.body.type) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let notification = await new BroadcastModel(req.body)

        await notification.save().then(notification => {
            MongoroUserModel.updateMany({ state: req.body.state }, { $set: { notification: { message: req.body.message, subject: req.body.subject, send_at: Date.now() } } }).then(async () => {
            })
            return res.status(200).json({
                msg: 'Notification sent successful ',
                notification: notification,
                status: 200
            })
        })
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.post('/notification/occupation', async (req, res) => {

    try {
        if (!req.body.recipent || !req.body.message || !req.body.type) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let notification = await new BroadcastModel(req.body)

        await notification.save().then(notification => {
            MongoroUserModel.updateMany({ occupation: req.body.occupation }, { $set: { notification: { message: req.body.message, subject: req.body.subject, send_at: Date.now() } } }).then(async () => {
            })
            return res.status(200).json({
                msg: 'Notification sent successful ',
                notification: notification,
                status: 200
            })
        })
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

//WIDGETS
router.post('/widget/email', async (req, res) => {

    try {
        if (!req.body.recipent || !req.body.message || !req.body.type) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let widget = await new BroadcastModel(req.body)

        await widget.save().then(widget => {
            MongoroUserModel.updateOne({ email: req.body.recipent }, { $set: { widget: { message: req.body.message, subject: req.body.subject, send_at: Date.now() } } }).then(async () => {
            })
            return res.status(200).json({
                msg: 'widget sent successful ',
                widget: widget,
                status: 200
            })
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})


router.post('/widget', async (req, res) => {

    try {
        if (!req.body.recipent || !req.body.message || !req.body.type) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let widget = await new BroadcastModel(req.body)

        await widget.save().then(widget => {
            MongoroUserModel.updateMany({ blocked: false }, { $set: { widget: { message: req.body.message, subject: req.body.subject, send_at: Date.now() } } }).then(async () => {
            })
            return res.status(200).json({
                msg: 'widget sent successful ',
                widget: widget,
                status: 200
            })
        })
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.post('/widget/state', async (req, res) => {

    try {
        if (!req.body.recipent || !req.body.message || !req.body.type) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let widget = await new BroadcastModel(req.body)

        await widget.save().then(widget => {
            MongoroUserModel.updateMany({ state: req.body.state }, { $set: { widget: { message: req.body.message, subject: req.body.subject, send_at: Date.now() } } }).then(async () => {
            })
            return res.status(200).json({
                msg: 'Notification sent successful ',
                widget: widget,
                status: 200
            })
        })
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.post('/widget/occupation', async (req, res) => {

    try {
        if (!req.body.recipent || !req.body.message || !req.body.type) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let widget = await new BroadcastModel(req.body)

        await widget.save().then(widget => {
            MongoroUserModel.updateMany({ occupation: req.body.occupation }, { $set: { widget: { message: req.body.message, subject: req.body.subject, send_at: Date.now() } } }).then(async () => {
            })
            return res.status(200).json({
                msg: 'widget sent successful',
                widget: widget,
                status: 200
            })
        })
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})


router.get("/all", async (req, res) => {
    try {
        const notification = await BroadcastModel.find();
        res.status(200).json(notification.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})


router.put('/edit', async (req, res) => {
    let body = JSON.parse(JSON.stringify(req.body));
    let { id } = body;

    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        await BroadcastModel.updateOne({ _id: id }, body).then(async () => {

            let broadcast = await BroadcastModel.findOne({ _id: id })


            return res.status(200).json({
                msg: 'Broadcast Updated Successfully ',
                broadcast: broadcast,
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

router.delete("/delete", async (req, res) => {
    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

        await BroadcastModel.deleteOne({ _id: req.body.id })
        res.status(200).json({ msg: "Notification deleted....", status: 200 });
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

});

//INVITE    
// router.post("/invite", async (req, res) => {

//     const user = await MongoroUserModel.findOne({ email: req.body.email });

//     const validate = await CategoryModel.findOne({ name: req.body.category })
//     if (!validate) return res.status(404).json({ msg: 'There is no such category !' })

//     if (user == null) {
//         console.log("User does not exists");
//         res.status(401).json({msg: "wrong Email !",status: 401});
//     } else {
//         await MongoroUserModel.updateOne({ _id: user._id }, { $set: { category: req.body.category } })

//         res.status(200).json({ msg: 'User Invited successfuly !',status: 200 });
//     }

// })

/////////APPMESSAGE//////////////////////////////////////


router.post('/appmessage', async (req, res) => {

    try {
        if (!req.body.recipent || !req.body.message || !req.body.type) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let appmessage = await new BroadcastModel(req.body)

        await appmessage.save().then(appmessage => {
            return res.status(200).json({
                msg: 'Notification sent successful ',
                appmessage: appmessage,
                status: 200
            })
        })
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }
})

router.get('/appmessage/:email', async (req, res) => {

    try {
        if (!req.params.email) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let user = await BroadcastModel.findOne({ recipent: req.params.email })

        return res.status(200).json({
            msg: 'notification Successful ',
            user: user,
            status: 200
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

})

router.get('/appmessage/:state', async (req, res) => {

    try {
        if (!req.params.state) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let user = await BroadcastModel.findOne({ recipent: req.params.state })
        if (user) {
            return res.status(200).json({
                msg: 'notification Successful ',
                user: user,
                status: 200
            })
           
        } else {
            res.status(400).json({ msg: "recipent not found" })
        }

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

})
router.get('/appmessage/:occupation', async (req, res) => {

    try {
        if (!req.params.occupation) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let user = await BroadcastModel.findOne({ recipent: req.params.occupation })

        return res.status(200).json({
            msg: 'notification Successful ',
            user: user,
            status: 200
        })

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry ',
            status: 500
        })
    }

})



module.exports = router