const express = require('express')
const dotenv = require("dotenv")
dotenv.config()
const { useAsync, utils, errorHandle, } = require('./../core');
const MindCastUser = require('../models/model.user')
const MindCastResource = require('../models/model.resources')



exports.resources = useAsync(async (req, res) => {

    try {

        const audit = await MindCastResource.create(req.body)
        return res.json(utils.JParser('Resources created successfully', !!audit, audit));

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }

})

exports.resourceUpdate = useAsync(async (req, res) => {

    try {
        // const id = req.userId;
        const id = req.params.id;
        const body = req.body
        await MindCastResource.updateOne({ _id: id }, body).then(async () => {
            const resource = await MindCastResource.find({ _id: id });
            return res.json(utils.JParser('Resources Updated  Successfully', !!resource, resource));
        })

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})


exports.singleResources = useAsync(async (req, res) => {
    try {
        const resources = await MindCastResource.findOne({ _id: req.params.id });
        return res.json(utils.JParser('Resources fetch successfully', !!resources, resources));
    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.allResources = useAsync(async (req, res) => {
    try {
        const resources = await MindCastResource.find();
        return res.json(utils.JParser('Resources fetch successfully', !!resources, resources));
    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.userResources = useAsync(async (req, res) => {

    try {

        let resources = await MindCastResource.find({ userID: req.params.id });

        return res.json(utils.JParser('User resources fetch successfully', !!resources, resources));

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.interestResources = useAsync(async (req, res) => {

    try {

        let resources = await MindCastResource.find({ interestID: req.params.id });

        return res.json(utils.JParser('Interest resources fetch successfully', !!resources, resources));

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }
})

exports.deleteResources = useAsync(async (req, res) => {
    try {
        if (!req.body.id) return res.status(402).json({ msg: 'provide the id ' })

        await MindCastResource.deleteOne({ _id: req.body.id })
        return res.json(utils.JParser('Resources deleted successfully', true, []));

    } catch (e) {
        throw new errorHandle(e.message, 400)
    }

});
