const mongoose = require('mongoose')

const MindCastUserSchema=new mongoose.Schema({
    firstName:{
        type:String,
    },
    lastName:{
        type:String, 
    },
    email:{
        type:String,
    },
    phone:{
        type:String,    
    },
    notification:{
        type:Boolean,
        default: false,
    },
    isHost:{
        type:Boolean,
        default: false,
    },
    status: {
        type: String,
        enum : ['free','paid','host'],
        default: 'free'
    },
    interest:{
        type:Array,
    },
    mood:{
        type:String,
    },
    token:{
        type:String,
    },
    time_created:{type:Number, default:()=>Date.now()},	
    updated_at:{type:Number, default:()=>Date.now()}	
})


const MindCastUser=mongoose.model("mindCastUser", MindCastUserSchema)

module.exports=MindCastUser