const mongoose = require('mongoose')

const TotalSchema=new mongoose.Schema({
    total_users:{
        type:String
    },
    total_saving:{
        type:String
    },
    total_transaction:{
        type:String
    },
    total_mpos_deposit:{
        type:String
    },
    total_saving:{
        type:String
    },
})


const TotalModel=mongoose.model("total", TotalSchema)

module.exports=TotalModel

