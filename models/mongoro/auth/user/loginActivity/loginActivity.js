const mongoose = require('mongoose')

const LoginActivitySchema=new mongoose.Schema({
    userId:{
        type:String
    },
    login_at:{
        type:Number, 
        default:()=>Date.now()
    },
    device:{
        type:String
    },
    ip:{
        type:String
    }
})


const LoginActivityModel=mongoose.model("login_activity", LoginActivitySchema)

module.exports=LoginActivityModel
