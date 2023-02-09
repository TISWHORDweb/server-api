const mongoose = require('mongoose')

const AdminChatSchema=new mongoose.Schema({
    message:{
        type:String
    },
    seen: {
        type: Boolean,
        default: false,
    },
    send_at:{type:Number, default:()=>Date.now()},	
})

const AdminChatModel=mongoose.model("AdminChat", AdminChatSchema)

module.exports=AdminChatModel

