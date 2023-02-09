const mongoose = require('mongoose')

const CategorySchema=new mongoose.Schema({
    message:{
        type:String
    },
    seen: {
        type: Boolean,
        default: false,
    },
    
    send_at:{type:Number, default:()=>Date.now()},	
})


const CategoryModel=mongoose.model("category", CategorySchema)

module.exports=CategoryModel

