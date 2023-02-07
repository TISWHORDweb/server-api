const mongoose = require('mongoose')


const mongoroUserSchema=new mongoose.Schema({
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
    category:{
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
    pin:{
        type:String
    },
    ip:{
        type:String
    },
    image:{
        type:String
    },
    wallet:{
        balance:{
            type:String,
            default: "0.00"
        },
        status:{
            type:String,
            default: "REGULAR (NGN)"
        },
        block:{
            type:String,
            default: false
        },
        updated_at:{type:Number, default:()=>Date.now()}
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const MongoroUserModel=mongoose.model("mongoro_register", mongoroUserSchema)


module.exports=MongoroUserModel
