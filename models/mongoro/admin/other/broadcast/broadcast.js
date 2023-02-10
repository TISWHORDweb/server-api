const mongoose = require('mongoose')

const BroadcastSchema=new mongoose.Schema({
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
    seen:{
        type:Boolean,
        default: false
    },
    send_at:{type:Number, default:()=>Date.now()},	
})

const BroadcastModel=mongoose.model("Broadcast", BroadcastSchema)

module.exports=BroadcastModel


