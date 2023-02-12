const mongoose = require('mongoose')

const WithdrawSchema=new mongoose.Schema({
    full_name:{
        type:String
    },
    date:{
        type:Number, 
        default:()=>Date.now()
    },
    amount:{
        type:String
    },
    status:{
        type:String
    },
    wallet_ID:{
        type:String
    },
    account_bank:{
        type:String
    },
    account_number:{
        type:String
    },
    reference:{
        type:String,
    },
    currency:{
        type:String,
    },
    debit_currency:{
        type:String,
    },
    narration:{
        type:String,
    },
    fee:{
        type:String,
    },
})

const WithdrawModel=mongoose.model("withdraw", WithdrawSchema)

module.exports=WithdrawModel
