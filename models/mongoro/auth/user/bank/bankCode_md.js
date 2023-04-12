const mongoose = require('mongoose')

const bankCodeSchema=new mongoose.Schema({
    code:{
        type:String
    },
    bank_name:{
        type:String
    },
    by:{
        type:String
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const bankCodeModel=mongoose.model("bank_code", bankCodeSchema)


module.exports=bankCodeModel
