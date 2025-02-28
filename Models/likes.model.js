import mongoose from 'mongoose'



const likesSchema = new mongoose.Schema({
    comment:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Comments'
    },
    liked: {
        type: Boolean,
        default: true,
      },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Video"
    },
    likeby:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    }
},{ timestamps:true})


export const Like = mongoose.model('Like',likesSchema)