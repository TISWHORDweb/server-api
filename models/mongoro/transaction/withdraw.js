const mongoose = require('mongoose')

const WithdrawSchema=new mongoose.Schema({
    transaction_ID:{
        type:String
    },
    Date:{
        type:Number, 
        default:()=>Date.now()
    },
    amount:{
        type:String
    },
    wallet_ID:{
        type:String
    },
    service_type:{
        type:String
    },
    status:{
        type:String
    },
    full_name:{
        type:String
    },
    account_number:{
        type:String
    },
    bank_name:{
        type:String
    },
    userId:{
        type:String
    },
    narration:{
        type:String
    },
    reference:{
        type:String
    },
    archive:{
        type:Boolean,
        default: false,
    },

})


const WithdrawModel=mongoose.model("withdraw", WithdrawSchema)

module.exports=WithdrawModel