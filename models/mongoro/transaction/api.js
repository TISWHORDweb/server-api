const mongoose = require('mongoose')

const TransferSchema=new mongoose.Schema({
    account_bank:{
        type:String
    },
    account_number:{
        type:String
    },
    amount:{
        type:String
    },
    narration:{
        type:String
    },
    currency:{
        type:String
    },
    reference:{
        type:Number, 
        default:()=>Date.now()
    },
    callback_url:{
        type:String
    },
    debit_currency:{
        type:String
    },
})


const TransferModel=mongoose.model("tickets", TransferSchema)

module.exports=TransferModel

