const mongoose = require('mongoose')

const OtherSchema=new mongoose.Schema({
    email:{
        type:String
    },
    category:{
        type:String
    },
    password:{
        type:String
    },
    blocked:{
        type:Boolean,
        default:false
    },
    ip:{
        type:String
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const OtherModel=mongoose.model("other_admin", OtherSchema)

module.exports=OtherModel

