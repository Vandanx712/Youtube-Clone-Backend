import { User } from "../Models/user.model.js";
import {asynchandller} from "../Utils/asynchandller.js";
import jwt from 'jsonwebtoken'


export const verifyjwt = asynchandller(async(req,res,next)=>{
    try {
        const token = await req.cookies?.accesstoken || req.header('Authorization')?.replace('Bearer ', '')
        if(!token){
            res.json('unauthorized request')
        }
        const decoded = jwt.verify(token,process.env.SECRET_TOKEN)
        const  user = await User.findById(decoded.id).select('-password -refreshtoken')
        req.user = user 
        next()
    } catch (error) {
        console.log(error);
    }
})
