import mongoose  from "mongoose";


const playlistschema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Video'
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
})


export const Playlist = mongoose.model('Playlist',playlistschema)