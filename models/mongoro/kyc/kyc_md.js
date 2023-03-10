const mongoose = require('mongoose')

const kycSchema=new mongoose.Schema({
    type:{
        type:String
    },
    auth_id: {
        type: String,
    },
    check: {
        type: String,
    },
    data: {
        type: {},
    },
    userId:{
        type:String
    },
    expire_at:{
        type:String
    },
    image:{
        type:String
    },
    validate_at:{type:Number, default:()=>Date.now()}		
})


const KycModel=mongoose.model("kyc", kycSchema)

module.exports=KycModel

