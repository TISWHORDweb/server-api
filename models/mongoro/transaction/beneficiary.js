const mongoose = require('mongoose')

const BeneficiarySchema=new mongoose.Schema({
    created_at:{
        type:Number, 
        default:()=>Date.now()
    },
    beneficiary_name:{
        type:String
    },
    account_number:{
        type:String
    },
    account_bank:{
        type:String
    },
    userId:{
        type:String
    },
    bank_name:{
        type:String
    },
    wallet_ID:{
        type:String
    },
})


const BeneficiaryModel=mongoose.model("beneficiary", BeneficiarySchema)

module.exports=BeneficiaryModel