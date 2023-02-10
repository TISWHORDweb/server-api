const express = require('express')
const router = express.Router()
const BroadcastModel = require("../../../../../models/mongoro/admin/other/broadcast/broadcast")
const dotenv = require("dotenv")
dotenv.config()


//CREATE
router.post('/', async (req, res) => {

    try {
        if (!req.body.recipent || !req.body.message || !req.body.type ) return res.status(402).json({ msg: 'provide the id ?',status: 402 })

        let notification = await new BroadcastModel(req.body)

        await notification.save().then(notification => {
            return res.status(200).json({
                msg: 'Category created successfully !!!',
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
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?',status: 402 })

        await CategoryModel.updateOne({ _id: id }, body).then(async () => {
           
            let category = await CategoryModel.findOne({ _id: id })
            await CategoryModel.updateOne({ updated_at: category.updated_at }, { $set: { updated_at: Date.now() } })
            return res.status(200).json({
                msg: 'Category Updated Successfully !!!',
                category: category,
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
        if (!req.body.id ) return res.status(402).json({ msg: 'provide the id ?' })

        await BroadcastModel.deleteOne({ _id: req.body.id })
        res.status(200).json({msg: "Notification deleted....",status: 200});
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



module.exports = router