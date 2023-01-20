const mongoose = require('mongoose')

const mongoroWaitlistSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'field is required']
    },
    email:{
        type:String,
        required:[true, 'field is required']
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const MongoroWaitlistModel=mongoose.model("mongoro_waitlists", mongoroWaitlistSchema)

module.exports=MongoroWaitlistModel
