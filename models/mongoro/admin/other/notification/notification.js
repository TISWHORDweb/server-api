const mongoose = require('mongoose')

const NotificationSchema=new mongoose.Schema({
    message:{
        type:String
    },
    type: {
        type: String
    },
    recipent:{
        type: String
    },
    subject:{
        type: String
    },
    send_at:{type:Number, default:()=>Date.now()},	
})

const NotificationModel=mongoose.model("Notification", NotificationSchema)

module.exports=NotificationModel

