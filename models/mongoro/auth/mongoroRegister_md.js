const mongoose = require('mongoose')

const mongoroRegisterSchema=new mongoose.Schema({
    first_name:{
        type:String,
        required:[true, 'field is required']
    },
    last_name:{
        type:String,
        required:[true, 'field is required']
    },
    image:{
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
    address:{
        type:String,
        required:[true, 'field is required']
    },
    username:{
        type:String,
        required:[true, 'field is required']
    },
    verification_code:{
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
    time_created:{type:Number, default:()=>Date.now()}		
})


const MongoroRegiserModel=mongoose.model("mongoro_register", mongoroRegisterSchema)

module.exports=MongoroRegiserModel



// const projectSchema = new mongoose.Schema({
//     isUsed: {
//         type: Boolean,
//         default: false
//     }
// });
