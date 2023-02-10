const mongoose = require('mongoose')

const mongoroUserSchema=new mongoose.Schema({
    first_name:{
        type:String,
    },
    last_name:{
        type:String,
    },
    setup_complete:{
        type:Boolean,
        default: false,
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
    email_code:{
        type:String,
    },
    sms_code:{
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
        wallet_ID:{
            type:String
        },
        status:{
            type:String,
            default: "REGULAR (NGN)"
        },
        updated_at:{type:Number, default:()=>Date.now()}
    },
    blocked:{
        type:Boolean,
        default: false
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const MongoroUserModel=mongoose.model("mongoro_register", mongoroUserSchema)


module.exports=MongoroUserModel
