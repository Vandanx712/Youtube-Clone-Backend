import mongoose, { Schema } from "mongoose";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'


const userschema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        index: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    avtar: {
        type: String, //courdinary url
        required: true,
    },
    password: {
        type: String,
        required: [true, "password is required"],
    },
    roles:{
        type:String,
        enum:['user','admin','Super_admin'],
        default:"user"
    },
    watchhistory: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Video'
        }
    ],
    refreshtoken: {
        type: String
    }
}, { timestamps: true })

userschema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password,10)
    next()
})
userschema.methods.ispasswordcorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}
userschema.methods.generaAccesstetoken = function () {
    return jwt.sign(
        {
            id: this._id,
            roles:this.roles
            
        },
        process.env.SECRET_TOKEN, { expiresIn: process.env.SECRET_TOKEN_EXPIRE }
    )
}
userschema.methods.generaRefreshtetoken = function () {
    return jwt.sign(
        {
            id: this._id,
        },
        process.env.REFRESH_TOKEN, { expiresIn: process.env.REFRESH_TOKEN_EXPIRE }
    )
}

export const User = mongoose.model('User', userschema)