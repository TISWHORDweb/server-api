const mongoose = require('mongoose')

const NotificationSchema=new mongoose.Schema({
    to:{
        type:String
    },
    from:{
        type:String
    },
    body:{
        type:String
    },
    title:{
        type:String
    },
    status:{
        type:Number,
        default: 0,
    },
    userId:{
        type:Number,
    },
})


const NotificationModel=mongoose.model("notification", NotificationSchema)

module.exports=NotificationModel