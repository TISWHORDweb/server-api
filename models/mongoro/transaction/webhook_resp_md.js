const mongoose = require('mongoose')

const WebhookSchema=new mongoose.Schema({
    created_at:{
        type:Number, 
        default:()=>Date.now()
    },
    response:{
        type:{}
    },
})


const WebhookModel=mongoose.model("webhook_response", WebhookSchema)

module.exports=WebhookModel