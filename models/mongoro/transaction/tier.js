const mongoose = require('mongoose')

const TierSchema=new mongoose.Schema({
    created_at:{
        type:Number, 
        default:()=>Date.now()
    },
    date:{
        type:String
    },
    userId:{
        type:String
    },
    amount:{
        type:String
    },
    limit:{
        type:String
    }
})


const TierModel=mongoose.model("tier", TierSchema)

module.exports=TierModel