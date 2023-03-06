const mongoose = require('mongoose')

const CommunityCommentSchema=new mongoose.Schema({
    userId:{
        type:String
    },
    created_at:{
        type:Number, 
        default:()=>Date.now()
    },
    postId:{
        type:String
    },
    comment:{
        type:String
    },
    like:{
        type:Number,
        default: 0
    }

})


const CommunityCommentModel=mongoose.model("community_comment", CommunityCommentSchema)

module.exports=CommunityCommentModel
