const mongoose = require('mongoose')

const CommunityPostSchema=new mongoose.Schema({
    userId:{
        type:String
    },
    created_at:{
        type:Number, 
        default:()=>Date.now()
    },
    heading:{
        type:String
    },
    description:{
        type:String
    },
    like:{
        type:Number,
        default: 0
    },
    category:{
        type:String
    },
    image:{
        type:String
    },
    approved:{
        type:Boolean,
        default: false,
    },

})


const CommunityPostModel=mongoose.model("community_post", CommunityPostSchema)

module.exports=CommunityPostModel