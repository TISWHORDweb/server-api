const mongoose = require('mongoose')

const AuditSchema=new mongoose.Schema({
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
    },
    message:{
        type:String
    }
})

const AuditModel=mongoose.model("audit", AuditSchema)

module.exports=AuditModel
