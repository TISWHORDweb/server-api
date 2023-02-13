const mongoose = require('mongoose')

const AccountSchema=new mongoose.Schema({
    account_resp:{
        type:{}
    },
    userId: {
        type: String,
    },
    send_at:{type:Number, default:()=>Date.now()},	
})


const AccountModel=mongoose.model("account_resp", AccountSchema)

module.exports=AccountModel

