const express = require('express')
const router = express.Router()
const MongoroUserModel = require("../../../../../models/mongoro/auth/mongoroUser_md")
const CategoryModel = require("../../../../../models/mongoro/admin/super_admin/category/category")
const dotenv = require("dotenv")
dotenv.config()


//CREATEr
router.post('/create', async (req, res) => {

    try {
        if (!req.body.name ) return res.status(402).json({ msg: 'please check the fields ?' })

        const validate = await CategoryModel.findOne({ name: req.body.name })
        if (validate) return res.status(404).json({ msg: 'There is another category with that name !' })

        let category = await new CategoryModel(req.body)

        await category.save().then(category => {
            return res.status(200).json({
                msg: 'Category created successfully !!!',
                category: category,
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
        const category = await CategoryModel.find();
        res.status(200).json(category.reverse());
    } catch (err) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }
})

router.get("/of/:id", async (req, res) => {
    try {
        const user = await MongoroUserModel.find({ category: req.params.id });

        res.status(200).json(user);
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

        await CategoryModel.deleteOne({ _id: req.body.id })
        res.status(200).json({msg: "Category deleted....",status: 200});
    } catch (error) {
        res.status(500).json({
            msg: 'there is an unknown error sorry !',
            status: 500
        })
    }

});

//INVITE    
router.post("/invite", async (req, res) => {

    const user = await MongoroUserModel.findOne({ email: req.body.email });

    const validate = await CategoryModel.findOne({ name: req.body.category })
    if (!validate) return res.status(404).json({ msg: 'There is no such category !' })

    if (user == null) {
        console.log("User does not exists");
        res.status(401).json({msg: "sorry..... User does not exists!",status: 401});
    } else {
        await MongoroUserModel.updateOne({ _id: user._id }, { $set: { category: req.body.category } })

        res.status(200).json({ msg: 'User Invited successfuly !',status: 200 });
    }

})

router.post("/disable", async (req, res) => {

    const user = await MongoroUserModel.findOne({ _id: req.body.id });

    if (!req.body.id) return res.status(402).json({ msg: 'provide the id ?', status: 402 })

    if (user == null) {
        console.log("User does not exists");
        res.status(401).json({msg: "wrong Email !",status: 401});
    } else {
        await MongoroUserModel.updateOne({ _id: user._id }, { $set: { category: "none" } })

        res.status(200).json({ msg: 'User Disabled successfuly !',status: 500 });
    }

})


module.exports = router