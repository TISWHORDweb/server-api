const mongoose = require('mongoose')

const CategorySchema=new mongoose.Schema({
    name:{
        type:String
    },
    updated_at:{
        type:String
    },
    created_at:{type:Number, default:()=>Date.now()}		
})


const CategoryModel=mongoose.model("super", CategorySchema)

module.exports=CategoryModel

