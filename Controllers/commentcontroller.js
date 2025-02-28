import mongoose, { isValidObjectId } from "mongoose";
import {Comment} from "../Models/comments.model.js";
import { Like } from "../Models/likes.model.js";
import { asynchandller } from "../Utils/asynchandller.js";


export const addcomment = asynchandller(async(req,res)=>{
    const { videoid } = req.params
    const { content } = req.body

    if(!isValidObjectId(videoid)){
        res.json('invaild video id')
    }
    if(content === ''){
         res.json('plz fill field')
    }

    const comment = await Comment.create({
        content:content,
        video:videoid,
        owner:req.user._id
    })

    const {username,avtar} = req.user

    const commentdata = {
        ...comment._doc,
        owner:{username,avtar},
        likescount:0,
        isOwner:true
    }
    return res.json({commentdata,message:'comment add successfully'})
})


export const updatecomment = asynchandller(async(req,res)=>{
    const {commentid} = req.params
    const {content} = req.body

    if(!content){
        return res.json('plz fill all field')
    }
    if(!isValidObjectId(commentid)){
        return res.json('invaild comment id')
    }
    const newcomment = await Comment.findByIdAndUpdate(commentid,{$set:{content}},{new:true}) 
    if(!newcomment){
        return res.json('error while editing comment')
    }

    return res.json({newcomment,message:'your comment update successfully'})
})


export const deletecomment = asynchandller(async(req,res)=>{
    const {commentid} = req.params
    if(!isValidObjectId(commentid)){
        res.json('invaild comment id')
    }
    
    const comment = await Comment.findByIdAndDelete(commentid)
    if(comment){
        return req.json('error while deleting comment')
    }
    const deletelikes = await Like.deleteMany({
        comment:new mongoose.Types.ObjectId(commentid)
    })

    return res.json({isDeleted:true, message:'your comment deleted successfully'})
})