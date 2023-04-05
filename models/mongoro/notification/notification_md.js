const mongoose = require('mongoose')

const NotificationSchema=new mongoose.Schema({
    to:{
        type:String
    },
    from:{
        type:String
    },
    body:{
        type:String
    },
    title:{
        type:String
    },
    status:{
        type:String,
        default: 0,
    },

})


const NotificationModel=mongoose.model("notification", NotificationSchema)

module.exports=NotificationModel