import { isValidObjectId } from "mongoose";
import { Like } from "../Models/likes.model.js";
import { Comment } from "../Models/comments.model.js";
import { Video } from "../Models/videos.model.js";
import { asynchandller } from "../Utils/asynchandller.js";


export const givelike = asynchandller(async (req, res) => {
    const { togglelike, videoid, commentid } = req.query
    let reqlike
    let userlike
    let like
    if (togglelike === 'true') reqlike = 'true'
    else reqlike = 'false'

    if (videoid) {
        if (!isValidObjectId(videoid)) {
            res.json('invaild video id')
        }
        const video = await Video.findById(videoid)
        if (!video) {
            res.json('video not found')
        }
        userlike = await Like.find({
            video: videoid,
            likeby: req.user._id
        })
        let isliked = false
        if (userlike.length > 0) {
            if (reqlike) {
                await Like.findByIdAndDelete(userlike[0]._id)
                isliked = false
                res.json('unlike video successfully')
            }
            else {
                isliked = false
                await userlike[0].save()
            }
        }
        else {
            like = await Like.create({
                video: videoid,
                likeby: req.user._id,
                liked: reqlike
            })
        }
        isliked = reqlike
    }
    else if (commentid) {
        if (!isValidObjectId(commentid)) {
            res.json('invaild comment id')
        }
        const comment = await Comment.findById(commentid)
        if (!comment) {
            res.json('comment not found')
        }
        userlike = await Like.find({
            comment: commentid,
            likeby: req.user._id
        })
        let isliked = false
        if (userlike.length > 0) {
            if (reqlike) {
                await Like.findByIdAndDelete(userlike[0]._id)
                isliked = false
                res.json('unlike comment successfully')
            }
            else {
                isliked = false
                await userlike[0].save()
            }
        }
        else {
            like = await Like.create({
                comment: commentid,
                likeby: req.user._id,
                liked: reqlike
            })
        }
        isliked = reqlike
    }
    else {
        if (!isValidObjectId(videoid)) {
            res.json('invaild video id')
        }
        const video = await Video.findById(videoid)
        if (!video) {
            res.json('video not found')
        }
        userlike = await Like.find({
            video: videoid,
            likeby: req.user._id
        })
        if (!isValidObjectId(commentid)) {
            res.json('invaild comment id')
        }
        const comment = await Comment.findById(commentid)
        if (!comment) {
            res.json('comment not found')
        }
        userlike = await Like.find({
            comment: commentid,
            likeby: req.user._id
        })
        let isliked = false
        if (userlike.length > 0) {
            if (reqlike) {
                await Like.findByIdAndDelete(userlike[0]._id)
                isliked = false
                res.json('unlike comment successfully')
            }
            else {
                isliked = false
                await userlike[0].save()
            }
        }
        else if (videoid) {
            like = await Like.create({
                video: videoid,
                likeby: req.user._id,
                liked: reqlike
            })
        }
        else if (commentid) {
            like = await Like.create({
                comment: commentid,
                likeby: req.user._id,
                liked: reqlike
            })
        }
        isliked = reqlike
    }

    let totalvideolikes, totalcommentlikes

    if (commentid) {
        totalcommentlikes = await Like.find({ comment: commentid, liked: true })
    }
    else if (videoid) {
        totalvideolikes = await Like.find({ video: videoid, liked: true })
    }

    return res.json({ totalvideolikes, totalcommentlikes, message: 'like toggle successfully' })
})

export const getalllikedvideo = asynchandller(async (req, res) => {
    const allikedvideos = await Like.aggregate([
        {
            $match: {
                likeby: req.user._id,
                liked:true
            }
        },
        {
            $lookup:{
                from:'Video',
                localField:'video',
                foreignField:'_id',
                as:'likedvideos',
                pipeline:[
                    {
                        $project:{
                            videofile:1,
                            title:1,
                            description:1,
                            duration:1,
                            thumbnail:1,
                        }
                    }
                ]
            }
        },
        {
            $group:{
                _id:'$video',
                userlikedvideos:{$push:'$likedvideos'}
            }
        }
        
    ])
    console.log(allikedvideos);
    
    return res.json({ videos:allikedvideos, message: "user's all liked videops" })
})