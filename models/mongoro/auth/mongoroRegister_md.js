const mongoose = require('mongoose')


const mongoroRegisterSchema=new mongoose.Schema({
    name:{
        type:String,
    },
    email:{
        type:String,
    },
    phone:{
        type:String,    
    },
    agreement:{
        type:Boolean,
        default: false,
    },
    verification_code:{
        type:String,
    },
    username:{
        type:String,
    },
    isverified:{
        type:Boolean,
        default: false,
    },
    role:{
        type:Boolean,
        default: false,
    },
    password:{
        type:String,
    },
    address:{
        type:String,
    },
    country:{
        type:String,
    },
    state:{
        type:String,    
    },
    city:{
        type:String,    
    },
    gender:{
        type:String,
    },
    occupation:{
        type:String,
    },
    purpose:{
        type:String,    
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const MongoroRegiserModel=mongoose.model("mongoro_register", mongoroRegisterSchema)

module.exports=MongoroRegiserModel

