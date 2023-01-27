const mongoose = require('mongoose')

const SuperSchema=new mongoose.Schema({
    email:{
        type:String
    },
    phone:{
        type:String
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const SuperModel=mongoose.model("super", SuperSchema)

module.exports=SuperModel

