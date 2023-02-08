const mongoose = require('mongoose')


function generateRandomLetter() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz"
    return alphabet[Math.floor(Math.random() * alphabet.length)]
}

const letter = generateRandomLetter()
const letterr = generateRandomLetter()
const ref = "MO_" + Math.floor(100000 + Math.random() * 900000) + letter + letterr + Math.floor(1000 + Math.random() * 9000)


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
    email_code:{
        type:String,
    },
    sms_code:{
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
        type:String,
        default: false
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const MongoroUserModel=mongoose.model("mongoro_register", mongoroUserSchema)


module.exports=MongoroUserModel
