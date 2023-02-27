const mongoose = require('mongoose')

const PosSchema=new mongoose.Schema({
    business_name:{
        type:String
    },
    type:{
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
    terminalId:{
        type:String
    },
    termsAndConditions:{
        type:Boolean,
        default:false
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const PosModel=mongoose.model("pos", PosSchema)

module.exports=PosModel

