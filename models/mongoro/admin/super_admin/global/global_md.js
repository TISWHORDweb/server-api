const mongoose = require('mongoose')

const GlobalSchema=new mongoose.Schema({
    disable_all_user: {
        type: Boolean,
        default:false
    },
    disable_all_transfer: {
        type: Boolean,
        default:false
    },
    by:{
        type:String
    },
    update_at:{type:Number, default:()=>Date.now()},	
})


const GlobalModel=mongoose.model("global", GlobalSchema)
module.exports=GlobalModel