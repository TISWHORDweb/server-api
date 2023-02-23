const express = require('express')
const router = express.Router()
const state = require('../state')


router.get('/', async (req,res) =>{
// const states = JSON.stringify(state)
res.status(200).json({states: state})
})

module.exports = router
