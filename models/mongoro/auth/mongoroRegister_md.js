const mongoose = require('mongoose')


const setupSchema=new mongoose.Schema({
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
        type:Boolean,
        default: false,
    },
    gender:{
        type:String,
    },
    occupation:{
        type:String,
    },
    purpose:{
        type:Boolean,
        default: false,
    }
})


const mongoroRegisterSchema=new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'field is required']
    },
    email:{
        type:String,
        required:[true, 'field is required']
    },
    phone:{
        type:String,    
        required:[true, 'field is required']
    },
    agreement:{
        type:Boolean,
        default: false,
        required:[true, 'field is required']
    },
    verification_code:{
        type:String,
        required:[true, 'field is required']
    },
    username:{
        type:String,
        required:[true, 'field is required']
    },
    isverified:{
        type:Boolean,
        default: false,
        required:[true, 'field is required']
    },
    role:{
        type:Boolean,
        default: false,
        required:[true, 'field is required']
    },
    password:{
        type:String,
        required:[true, 'field is required']
    },
    confirm_password:{
        type:String,
        required:[true, 'field is required']
    },
    account_setup:[setupSchema],
    time_created:{type:Number, default:()=>Date.now()}		
})


const MongoroRegiserModel=mongoose.model("mongoro_register", mongoroRegisterSchema)

module.exports=MongoroRegiserModel

