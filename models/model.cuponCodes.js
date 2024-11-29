const mongoose = require('mongoose')
const { Schema } = mongoose;
const MindCastCuponCodeSchema=new mongoose.Schema({
    coupon:{
        type:String,
    },
    email:{
        type:String,
    },
    duration:{
        type:Number, 
    },
    price:{
        type:Number,    
    },
    assignedName:{
        type:String,    
    },
    userID:{
        type: Schema.Types.ObjectId, ref: 'mindCastUser',
    },
    companyID:{
        type: Schema.Types.ObjectId, ref: 'mindCastUser',
    },
   
    exp_date: {
        type: Number,
    },
    status: {
        type: String, 
        enum : ['pending','active','expired'],
        default: 'pending'
    },
    duration_type: {
        type: String, 
        enum : ['month','week',],
        default: 'month'
    },
    time_created:{type:Number, default:()=>Date.now()},	
    updated_at:{type:Number, default:()=>Date.now()}	
})


const MindCastCuponCode=mongoose.model("MindCastCuponCode", MindCastCuponCodeSchema)

module.exports=MindCastCuponCode