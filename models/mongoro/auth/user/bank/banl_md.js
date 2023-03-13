const mongoose = require('mongoose')

const bankSchema=new mongoose.Schema({
    userId:{
        type:String
    },
    real_bank_account_number:{
        type:String
    },
    real_bank_name:{
        type:String
    },
    real_bank_code:{
        type:String
    },
    account_name:{
        type:String
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const BankModel=mongoose.model("bank", bankSchema)


module.exports=BankModel
