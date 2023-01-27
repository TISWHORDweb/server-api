const mongoose = require('mongoose')

const kycSchema=new mongoose.Schema({
    bvn:{
        type:String
    },
    national_id:{
        type:String
    },
    international_passport:{
        type:String
    },
    myidentikey:{
        type:String
    },
    userId:{
        type:String
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const KycModel=mongoose.model("kyc", kycSchema)

module.exports=KycModel

