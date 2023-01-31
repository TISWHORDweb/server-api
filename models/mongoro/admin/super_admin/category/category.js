const mongoose = require('mongoose')

const CategorySchema=new mongoose.Schema({
    name:{
        type:String
    },
    updated_at:{type:Number, default:()=>Date.now()},
    created_at:{type:Number, default:()=>Date.now()}		
})


const CategoryModel=mongoose.model("category", CategorySchema)

module.exports=CategoryModel

