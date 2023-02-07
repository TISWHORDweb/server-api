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
    userID:{
        type:String
    },
    service_type:{
        type:String
    },
    status:{
        type:String
    },
    archive:{
        type:Boolean,
        default: false,
    },
})


const TransferModel=mongoose.model("transaction", TransferSchema)

module.exports=TransferModel

