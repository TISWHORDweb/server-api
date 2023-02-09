const mongoose = require('mongoose')

const UserChatSchema=new mongoose.Schema({
    message:{
        type:String
    },
    seen: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: String,
        default: false,
    },
    send_at:{type:Number, default:()=>Date.now()},	
})


const UserChatModel=mongoose.model("userchat", UserChatSchema)

module.exports=UserChatModel

