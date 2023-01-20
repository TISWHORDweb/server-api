const mongoose = require('mongoose')

const reefWaitlistSchema=new mongoose.Schema({
    email:{
        type:String,
        required:[true, 'field is required']
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const ReefWaitlistModel=mongoose.model("reef_waitlists", reefWaitlistSchema)

module.exports=ReefWaitlistModel

