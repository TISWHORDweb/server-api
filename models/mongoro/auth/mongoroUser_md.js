const mongoose = require('mongoose')

const mongoroUserSchema=new mongoose.Schema({
    middle_name:{
        type:String,
    },
    surname:{
        type:String, 
    },
    first_name:{
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
    isverified:{
        type:Boolean,
        default: false,
    },
    role:{
        type:String,
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
    wallet_balance:{
        type:String,
        default: "0.00"
    },
    wallet_ID:{
        type:String
    },
    wallet_status:{
        type:String,
        default: "REGULAR (NGN)"
    },
    wallet_updated_at:{type:Number, default:()=>Date.now()},
    notification:{
        message:{
            type:String
        },
        subject:{
            type: String
        },
        seen:{
            type:Boolean,
            default: false
        },
        send_at:{type:Number, default:()=>Date.now()},	
    },
    widget:{
        message:{
            type:String
        },
        subject:{
            type: String
        },
        seen:{
            type:Boolean,
            default: false
        },
        send_at:{type:Number, default:()=>Date.now()},	
    },
    blocked:{
        type:Boolean,
        default: false
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const MongoroUserModel=mongoose.model("mongoro_register", mongoroUserSchema)


module.exports=MongoroUserModel