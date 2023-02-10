const mongoose = require('mongoose')

const AppmessageSchema=new mongoose.Schema({
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

const AppmessageModel=mongoose.model("Appmessage", AppmessageSchema)

module.exports=AppmessageModel


