import mongoose from "mongoose";

const videosschema = new mongoose.Schema({
    videofile:{
        type:String,
        required:true
    },
    title:{
        type:String,
        required:true,
        index:true
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
    thumbnail:{
        type:String,
        required:true,
    },
    description:{
        type:String,
        required:true
    },
    duration:{
        type:Number,
    },
    views:{
        type:Number,
        default:0
    },
    ispublished:{
        type:Boolean,
        default:true
    },
},{timestamps:true})


export const Video = mongoose.model('Video',videosschema)