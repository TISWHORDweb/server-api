const mongoose = require('mongoose')

const MindCastCouponPaymentSchema=new mongoose.Schema({
    email:{
        type:String,
    },
    status:{
        type:String, 
    },
    
    
    time_created:{type:Number, default:()=>Date.now()},	
    updated_at:{type:Number, default:()=>Date.now()}	
})


const MindCastCouponPayment=mongoose.model("mindCouponPayment", MindCastCouponPaymentSchema)

module.exports=MindCastCouponPayment
