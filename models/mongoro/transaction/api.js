const mongoose = require('mongoose')

const TransferSchema=new mongoose.Schema({
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
    biller_name:{
        type:String
    },
    country:{
        type:String
    },
    type:{
        type:String
    },
    customer:{
        type:String
    },
    narration:{
        type:String
    },
    archive:{
        type:Boolean,
        default: false,
    },

})




const TransferModel=mongoose.model("transaction", TransferSchema)

module.exports=TransferModel