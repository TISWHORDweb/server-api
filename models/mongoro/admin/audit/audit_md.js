const mongoose = require('mongoose')

const AdminAuditSchema=new mongoose.Schema({
    adminId:{
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
    },
    email:{
        type:String
    }
})

const AdminAuditModel=mongoose.model("admin_audit", AdminAuditSchema)

module.exports=AdminAuditModel
