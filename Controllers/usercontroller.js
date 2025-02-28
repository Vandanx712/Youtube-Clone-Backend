import { asynchandller } from "../Utils/asynchandller.js";
import { User } from '../Models/user.model.js'
import { Userotp } from '../Models/userotp.model.js'
import { uploadphotooncloudinary } from '../Utils/cloundinary.js'
import { generateAccessandRefreshtToken } from "../Utils/generatetokens.js";
import jwt from 'jsonwebtoken'
import mongoose, { isValidObjectId } from "mongoose";
import sendOTP from "../Utils/sendOTP.js";
import { generateotp } from "../Utils/generateotp.js";


export const registeruser = asynchandller(async (req, res) => {
    const { username, email, password } = req.body
    if ([username, email, password].some((field) => field?.trim() === '')) {  // trim a feild ni aagal ane pachal ni space ne remove karse
        res.json(400, 'all fields are required')              // some e map jevu work karse
    }
    const existeduser = await User.findOne({ $or: [{ username }, { email }] })
    if (existeduser) {
        res.json('Sorry, user alreay exist')
    }
    const avtarlocalpath = req.file.path;
    if (!avtarlocalpath) {
        res.json('plz upload avtar')
    }
    const avtar = await uploadphotooncloudinary(avtarlocalpath)
    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        avtar: avtar.url
    })
    const createduser = await User.findById(user._id).select('-password -refreshtoken')
    if (!createduser) return res.json('fetch some mistake plz fill all field again');
    return res.json('user registerd successfully')
})

export const registeradmin = asynchandller(async (req, res) => {
    const { username, email, password } = req.body

    const avtarlocalpath = req.file.path;
    if (!avtarlocalpath) {
        res.json('plz upload avtar')
    }
    const avtar = await uploadphotooncloudinary(avtarlocalpath)
    const user = await User.create({
        username,
        email: email.toUpperCase(),
        password,
        roles: 'admin',
        avtar: avtar.url
    })
    const createduser = await User.findById(user._id).select('-password -refreshtoken')
    if (!createduser) return res.json('fetch some mistake plz fill all field again');
    return res.json('admin registerd successfully')
}) // admin

export const registersuperadmin = asynchandller(async (req, res) => {
    const { username, email, password } = req.body

    const avtarlocalpath = req.file.path;
    if (!avtarlocalpath) {
        res.json('plz upload avtar')
    }
    const avtar = await uploadphotooncloudinary(avtarlocalpath)
    const user = await User.create({
        username: username.toUpperCase(),
        email,
        password,
        roles: 'Super_admin',
        avtar: avtar.url
    })
    const createduser = await User.findById(user._id).select('-password -refreshtoken')
    if (!createduser) return res.json('fetch some mistake plz fill all field again');
    return res.json('Superadmin registerd successfully')
}) // superadmin

export const loginuser = asynchandller(async (req, res) => {
    const { email, password } = req.body
    const existuser = await User.findOne({ email })
    if (!existuser) {
        res.json(404, 'sorry your account not found')
    }
    const passwordvalid = await existuser.ispasswordcorrect(password)
    if (!passwordvalid) {
        res.json('plz enter currect password')
    }

    const userrole = existuser.roles
    if (userrole == 'admin' || 'Super_admin') {
        const { accesstoken, refreshtoken } = await generateAccessandRefreshtToken(existuser._id)

        const options = {
            httpOnly: true,
            secure: true
        }
        return res
            .status(200)
            .cookie('accesstoken', accesstoken, options)
            .cookie('refreshtoken', refreshtoken, options)
            .json('login successfully')
    } 
    // direct login for admin & superadmin 

    const otp = generateotp()
    await Userotp.create({
        userid: existuser._id,
        otp: otp,
        expiresin: new Date(Date.now() + 2 * 60 * 1000)
    })
    await sendOTP(email, otp)
    return res.json(' OTP send on mail successfully')
})

export const verifyotp = asynchandller(async (req, res) => {

    const { username, otp } = req.body
    const { resendotp } = req.query

    const user = await User.findOne({ username })
    if (!user) {
        res.json('user not found')
    }

    const userid = user._id
    let useremail = user.email
    const verifyuser = await Userotp.findOne({ userid })

    if (resendotp == 'true') {
        const otp = generateotp()
        await Userotp.create({
            userid: userid,
            otp: otp,
            expiresin: new Date(Date.now() + 2 * 60 * 1000)
        })
        await sendOTP(useremail, otp)
    }

    if (Date.now() > verifyuser.expiresin) {
        res.json('sorry your otp is invaild')
        await Userotp.findByIdAndDelete(verifyuser._id)
    }

    if (otp !== verifyuser.otp) {
        res.json('your otp is incorrect')
    } else {
        const { accesstoken, refreshtoken } = await generateAccessandRefreshtToken(user._id)

        const options = {
            httpOnly: true,
            secure: true
        }

        await Userotp.findByIdAndDelete(verifyuser._id)
        return res
            .status(200)
            .cookie('accesstoken', accesstoken, options)
            .cookie('refreshtoken', refreshtoken, options)
            .json('login successfully')
    }
})// verify otp

export const logoutuser = asynchandller(async (req, res) => {
    await User.findByIdAndUpdate(req.user._id, { $unset: { refreshtoken: 1 } }, { new: true })
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
        .status(200)
        .clearCookie('accesstoken', options)
        .clearCookie('refreshtoken', options)
        .json('user logout successfully')
})

export const refreshAccesstoken = asynchandller(async (req, res) => {
    const incomingrefreshtoken = req.cookies.refreshtoken || req.body.refreshtoken
    if (!incomingrefreshtoken) {
        res.json('unauthorized request')
    }
    const decodedtoken = jwt.verify(incomingrefreshtoken, process.env.REFRESH_TOKEN)
    const user = await User.findById(decodedtoken.id)
    if (!user) {
        res.json('Invalid refresh token')
    }
    if (incomingrefreshtoken !== user.refreshtoken) {
        res.json('refresh token is expired')
    }
    const options = {
        httpOnly: true,
        secure: true
    }
    const { newaccesstoken, newrefreshtoken } = await generateAccessandRefreshtToken(user._id)
    return res
        .status(200)
        .cookie('accesstoken', newaccesstoken, options)
        .cookie('refreshtoken', newrefreshtoken, options)
        .json()
})

export const updatepassword = asynchandller(async (req, res) => {
    const { oldpassword, newpassword } = req.body
    const user = await User.findById(req.user._id)
    const presentpassword = await user.ispasswordcorrect(oldpassword)
    if (!presentpassword) {
        res.json('invaild old password')
    }
    user.password = newpassword
    await user.save({ validateBeforeSave: false })

    return res.status(200).json('change password successfully')
})

export const updateAccoutdetail = asynchandller(async (req, res) => {
    const { username, email } = req.body
    if ([username, email].some((fields) => fields?.trim() === '')) {
        res.json('all fields are required')
    }
    const existeduser = await User.findOne({ $or: [{ username }, { email }] })
    if (existeduser) {
        res.json('sorry, user already exist')
    }
    const user = await User.findByIdAndUpdate(req.user._id, { $set: { username, email } }, { new: true }).select('-password')
    return res.json('your accoutdetails update successfullly')
})

export const updateuserRole = asynchandller(async (req, res) => {
    const { userid, updaterole } = req.query

    if (!isValidObjectId(userid)) {
        res.json('invaild user id')
    }

    if (!['user', 'admin', 'Super_admin'].includes(updaterole)) {
        res.json('plz asign vaild role')
    }

    const user = await User.findById(userid)
    if (!user) {
        res.json('user not found')
    }
    user.roles = updaterole
    await user.save()

    return res.json('update user role successfully')
})   // admin or superadmin

export const getcurrentuser = asynchandller(async (req, res) => {
    return res.json({ user: req.user, message: "your detail fetched successfully" })
})

export const updateuseravtar = asynchandller(async (req, res) => {
    const insertedpath = req.file.path
    if (!insertedpath) {
        res.json('avtsrfile is missing')
    }
    const avtar = await uploadphotooncloudinary(insertedpath)
    if (!avtar.url) {
        res.json('uploading mistake')
    }
    const user = await User.findByIdAndUpdate(req.user._id, { $set: { avtar: avtar.url } }, { new: true }).select('-password')
    return res.json('update avatar successfully')
})

export const getuserchannel = asynchandller(async (req, res) => {
    const { username } = req.params
    if (!username?.trim()) {
        res.json('username is missing')
    }
    const channel = await User.aggregate([
        {
            $match: {
                username: username.toLowerCase()
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'channel',
                as: 'Subscribers'
            }
        },
        {
            $lookup: {
                from: 'subscriptions',
                localField: '_id',
                foreignField: 'subscriber',
                as: 'Subscribed'
            }
        },
        {
            $addFields: {
                subscriberscount: {
                    $size: '$Subscribers'
                },
                chennalsubsccribedcount: {
                    $size: '$Subscribed'
                },
                isSubscribed: {
                    $cond: {
                        if: { $in: [req.user._id, '$Subscribers.subscriber'] },
                        then: true,
                        else: false
                    }
                }
            }
        },
        {
            $project: {
                username: 1,
                avtar: 1,
                subscriberscount: 1,
                chennalsubsccribedcount: 1
            }
        }
    ])
    if (!channel.length) {
        res.json('channel does not exists')
    }
    return res
        .status(200)
        .json({ channel: channel[0], message: 'userchannel fetch successfully' })
    //.json({channel, message:'user channel fetch successfully'})
})

export const getwatchhistory = asynchandller(async (req, res) => {
    const user = await User.aggregate([
        {
            $match: {
                _id: new mongoose.Types.ObjectId(req.user._id)
            }
        },
        {
            $lookup: {
                from: 'videos',
                localField: 'watchhistory',
                foreignField: '_id',
                as: 'watchHistory',
                pipeline: [
                    {
                        $lookup: {
                            from: 'users',
                            localField: 'owner',
                            foreignField: '_id',
                            as: 'owner',
                            pipeline: [
                                {
                                    $project: {
                                        username: 1,
                                        avtar: 1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addFields: {
                            owner: {
                                $first: '$owner'
                            }
                        }
                    }
                ]
            }
        }
    ])

    return res
        .status(200)
        .json(user.watchhistory, 'watchHistory fetched successfully')
})

export const deletechannel = asynchandller(async(req,res)=>{
    const {channelid} = req.params

    if(!isValidObjectId(channelid)){
        res.json('sorry! admins this id is invalid')
    }

    const deleteduser = await User.findByIdAndDelete(channelid)
    
    return res.json(`Admins you are delete account of ${channelid}`)
})