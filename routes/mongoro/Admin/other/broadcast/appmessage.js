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
                msg: 'Notification sent successful !!!',
                notification: notification,
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


router.post('/notification', async (req, res) => {

    try {
        if (!req.body.recipent || !req.body.message || !req.body.type) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

        let notification = await new BroadcastModel(req.body)

        await notification.save().then(notification => {
            MongoroUserModel.updateMany({ blocked: false }, { $set: { notification: { message: req.body.message, subject: req.body.subject, send_at: Date.now() } } }).then(async () => {
            })
            return res.status(200).json({
                msg: 'Notification sent successful !!!',
                notification: notification,
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

router.get("/all", async (req, res) => {
    try {
        const notification = await BroadcastModel.find();
        res.status(200).json(notification.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
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
                msg: 'Broadcast Updated Successfully !!!',
                broadcast: broadcast,
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

router.delete("/delete", async (req, res) => {
    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?' })

        await BroadcastModel.deleteOne({ _id: req.body.id })
        res.status(200).json({ msg: "Notification deleted....", status: 200 });
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
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

/////////NOTIFICATION//////////////////////////////////////

router.get('/notification', async (req, res) => {
    try {
        if (!req.params.email) return res.status(402).json({ msg: 'provide the email ?', status: 402 })

        let user = await BroadcastModel.findOne({ recipent: req.params.email })

        if (!user) {
            res.status(400).json({ msg: "user not found", code: 400 })
        } else {
            await BroadcastModel.find().limit(1).sort({ $natural: -1 }).then((data => {
                return res.status(200).json({
                    msg: 'Last notification get Successfully !!!',
                    data: data,
                    status: 200
                })
            }))
        }

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

})

router.get('/notification', async (req, res) => {

    try {
        await BroadcastModel.find().limit(1).sort({ $natural: -1 }).then((data => {
            return res.status(200).json({
                msg: 'Last notification get Successfully !!!',
                data: data,
                status: 200
            })
        }))

    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

})



module.exports = router