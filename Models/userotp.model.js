import mongoose from "mongoose";


const userOTPschema = new mongoose.Schema({
    userid:{
        type:String,
    },
    otp:{
        type:String
    },
    expiresin:{
        type:Number
    }
},{timestamps:true})


export const Userotp = mongoose.model('Userotp',userOTPschema)