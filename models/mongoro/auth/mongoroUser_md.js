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
    account_created:{
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
    date:{
        type:Date,    
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
        default: 0
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
    verification:{
        bvn:{
            type:Boolean,
            default: false
        },
        kyc:{
            type:Boolean,
            default: false
        },
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
    active:{
        type:Boolean,
        default: false
    },
    account:{
        type:{}
    },
    real_bank_account_number:{
        type:String
    },
    real_bank_name:{
        type:String
    },
    verification_number:{
        type:String
    },
    welcome_message:{
        notification:{
            type:Boolean,
            default: true
        },
        email:{
            type:Boolean,
            default: false
        },
    },
    transaction_alert:{
        notification:{
            type:Boolean,
            default: true
        },
        email:{
            type:Boolean,
            default: false
        },
    },
    login_alert:{
        notification:{
            type:Boolean,
            default: true
        },
        email:{
            type:Boolean,
            default: false
        },
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const MongoroUserModel=mongoose.model("mongoro_register", mongoroUserSchema)


module.exports=MongoroUserModel
