import { asynchandller } from "../Utils/asynchandller.js";
import { uploadphotooncloudinary,uploadvideooncloudinary } from "../Utils/cloundinary.js";
import  {Video}  from '../Models/videos.model.js'
import {Like} from '../Models/likes.model.js'
import {Comment} from '../Models/comments.model.js'
import mongoose, { isValidObjectId } from "mongoose";


export const uploadvideo = asynchandller(async(req,res)=>{
    const { title, description} = req.body
    const videolocalpath =  req.files?.video?.[0]?.path;
    if(!videolocalpath){
        res.json('plz, upload video file ')
    }
    const thumbnaillocalpath = req.files?.thumbnail?.[0]?.path;
    if(!thumbnaillocalpath){
        res.json('plz, upload thumbnail file')
    }
    const videoUL = await uploadvideooncloudinary(videolocalpath)
    const thumbnail = await uploadphotooncloudinary(thumbnaillocalpath)
    // const v = videoUL.url
    // const thum = thumbnail.url
    // console.log(v);
    // console.log(thum);
    
    const video = await Video.create({
        title,
        description,
        //duration:videoUL.duration,
        owner:req.user._id,
        videofile: videoUL.url,
        thumbnail:thumbnail.url
    })
    const uploadedvideo = await Video.findById(video._id).select('-comments -likes')
    if(!uploadedvideo){
        res.json('fetch some mistake plz fill all fields agian')
    }
    return res.json('video upload successfully')
})

export const getvideobyid = asynchandller(async(req,res)=>{
    const { videoid } = req.params
    if(!isValidObjectId(videoid)){
        res.json('Invaild video id')
    }
    const video = await Video.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(videoid),
                ispublished:true
            }
        },
        {
            $lookup:{
                from:'likes',
                localField:'_id',
                foreignField:'video',
                as:'likes',
                pipeline:[
                    {
                        $match:{
                            liked:true
                        }
                    },
                    {
                        $group:{
                            _id:'$liked',
                            likeOwners:{$push:'$likedBy'}
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                likes:{
                    $cond:{
                        if:{
                            $gt:[{$size:'$likes'},0]
                        },
                        then: { $first:'$likes.likeOwners'},
                        else:[]
                    }
                }
            }
        },
        {
            $lookup:{
                from:'comments',
                localField:'_id',
                foreignField:'video',
                as:'comments',
                pipeline:[
                    {
                        $match:{
                            commented:true
                        }
                    },
                    {
                        $group:{
                            _id:'$commented',
                            commentOwners:{$push:'$owner'}
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                comments:{
                    $cond:{
                        if:{
                            $gt:[{$size:'$comments'},0]
                        },
                        then:{$first:'$comments.commentOwners'},
                        else:[]
                    }
                }
            }
        },
        {
            $project:{
                videofile:1,
                title:1,
                description:1,
                duration:1,
                thumbnail:1,
                views:1,
                owner:1,
                createdAt: 1,
                updateAt:1,
                totallikes:{
                    $size:'$likes'
                },
                totalcomments:{
                    $size:'$comments'
                }
            }
        }
    ])


    if(!video.length > 0){
       return res.json('oops! video not found')
    }
    return res.json({video:video[0],message:'video get successfully'})
})

export const getallvideo = asynchandller(async(req,res)=>{
    const { userid } = req.params
    let filters = { ispublished:true }

    if(isValidObjectId(userid)){
        filters.owner = new mongoose.Types.ObjectId(userid)
    }
    let pipeline = [
        {
            $match:{
                ...filters
            },
        },
    ]
    pipeline.push({
        $sort:{
            createdAt : -1
        }
    })
    const allvideo = await Video.aggregate(Array.from(pipeline))
    return res.json({allvideo, message:"user's all videos"})
})

export const deletevideo = asynchandller(async(req,res)=>{
    const { videoid } = req.params
    if(!isValidObjectId(videoid)){
        res.json('video not found')
    }

    await Video.findByIdAndDelete(videoid)
    const deletevideolikes = await Like.deleteMany({
        video: new mongoose.Types.ObjectId(videoid)
    })
    // if(deletecommentslike){
    //     res.json('oops! some issues')
    // }
    // const videocomments = await Comment.find({
    //     video: new mongoose.Types.ObjectId(videoid)
    // })
    // const commentids = videocomments.map((comment)=>comment._id)
    // const deletecommentslike = await Like.deleteMany({
    //     comment:{$in:commentids}
    // })
    const deletecomment = await Comment.deleteMany({
        video: new mongoose.Types.ObjectId()
    })
    return res.json(' your video delete successfully')
})