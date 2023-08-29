const mongoose = require('mongoose')

const MindCastUserSchema=new mongoose.Schema({
    firstName:{
        type:String,
    },
    lastName:{
        type:String, 
    },
    experience:{
        type:String, 
    },
    userBio:{
        type:String, 
    },
    image:{
        type:String, 
    },
    email:{
        type:String,
    },
    phone:{
        type:String,    
    },
    password:{
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
    active:{
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
    username:{
        type:String,
    },
    mood:{
        type:String,
    },
    token:{
        type:String,
    },
    blocked:{
        type:Boolean,
        default: false,
    },
    isverified:{
        type:String,
    },
    lastLogin:{
        type:String,
    },
    ip:{
        type:String,
    },
    whoIs: {
        type: Number,
        enum : [0,1,2],
        default: 0
    },
    time_created:{type:Number, default:()=>Date.now()},	
    updated_at:{type:Number, default:()=>Date.now()}	
})


const MindCastUser=mongoose.model("mindCastUser", MindCastUserSchema)

module.exports=MindCastUser