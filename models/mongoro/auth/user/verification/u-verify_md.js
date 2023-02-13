const mongoose = require('mongoose')

const BvnDetailsSchema=new mongoose.Schema({
    uverify_resp:{
        type:{}
    },
    userId: {
        type: String,
    },
    b_id: {
        type: String,
    },
    check:{
        type:Boolean,
        default: false,
    },
    send_at:{type:Number, default:()=>Date.now()},	
})


const BvnDefaultModel=mongoose.model("Uverify_resp", BvnDetailsSchema)

module.exports=BvnDefaultModel

