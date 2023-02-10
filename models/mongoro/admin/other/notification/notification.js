const mongoose = require('mongoose')

const NotificationSchema=new mongoose.Schema({
    message:{
        type:String
    },
    type: {
        type: Boolean,
        default: false,
    },
    recipent:{
        type: String
    },
    subject:{
        type: String
    },
    subject:{
        type: String
    },
    send_at:{type:Number, default:()=>Date.now()},	
})

const NotificationModel=mongoose.model("AdminChat", NotificationSchema)

module.exports=NotificationModel

