const mongoose = require('mongoose')

const PosSchema=new mongoose.Schema({
    business_name:{
        type:String
    },
    owner_name:{
        type:String
    },
    phone:{
        type:String
    },
    quantity:{
        type:String
    },
    address:{
        type:String
    },
    state:{
        type:String
    },
    city:{
        type:String
    },
    country:{
        type:String
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const PosModel=mongoose.model("pos", PosSchema)

module.exports=PosModel

