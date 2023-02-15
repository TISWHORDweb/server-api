const mongoose = require('mongoose')

const BvnDetailsSchema=new mongoose.Schema({
    b_id: {
        type: String,
    },
    check: {
        type: String,
    },
    data: {
        type: {},
    },
    send_at:{type:Number, default:()=>Date.now()},	
})


const BvnDefaultModel=mongoose.model("Uverify_resp", BvnDetailsSchema)

module.exports=BvnDefaultModel
