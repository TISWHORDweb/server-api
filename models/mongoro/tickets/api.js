const mongoose = require('mongoose')

const TicketSchema=new mongoose.Schema({
    username:{
        type:String
    },
    option:{
        type:String
    },
    amount:{
        type:String
    },
    method:{
        type:String
    },
    status:{
        type:String
    },
    description:{
        type:String
    },
    userId:{
        type:String
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const TicketModel=mongoose.model("pos", TicketSchema)

module.exports=TicketModel

