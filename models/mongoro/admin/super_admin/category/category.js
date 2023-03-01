const mongoose = require('mongoose')

const CategorySchema=new mongoose.Schema({
    category:{
        type:String
    },
    dashboard: {
        type: Boolean,
        default: false,
    },
    users: {
        type: Boolean,
        default: false,
    },
    category_ID: {
        type: String,
    },
    manage_service: {
        type: Boolean,
        default: false,
    },
    services: {
        type: Boolean,
        default: false,
    },
    transaction: {
        type: Boolean,
        default: false,
    },
    invoices: {
        type: Boolean,
        default: false,
    },
    wallet: {
        type: Boolean,
        default: false,
    },
    subscription: {
        type: Boolean,
        default: false,
    },
    packages: {
        type: Boolean,
        default: false,
    },
    providers: {
        type: Boolean,
        default: false,
    },
    settings: {
        type: Boolean,
        default: false,
    },
    super_admin: {
        type: Boolean,
        default: false,
    },
    updated_at:{type:Number, default:()=>Date.now()},
    created_at:{type:Number, default:()=>Date.now()}		
})


const CategoryModel=mongoose.model("category", CategorySchema)

module.exports=CategoryModel

