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
        type:String,
        default:"Open ticket"
    },
    description:{
        type:String
    },
    image:{
        type:String
    },
    name:{
        type:String
    },
    email:{
        type:String
    },
    ID:{
        type:String
    },
    time_created:{type:Number, default:()=>Date.now()}		
})


const TicketModel=mongoose.model("support_tickets", TicketSchema)

module.exports=TicketModel

