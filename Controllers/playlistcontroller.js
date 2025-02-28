import mongoose, { isValidObjectId } from "mongoose";
import { Playlist } from "../Models/playlist.model.js";
import { asynchandller } from "../Utils/asynchandller.js";


export const createplaylist = asynchandller(async(req,res)=>{
    const { title } = req.body

    const playlist = await Playlist.create({
        title,
        owner:req.user._id 
    })

    if(!playlist){
        res.json('oops! some issues')
    }

    return res.json({playlist, message:'playlist create successfully'})
})

export const addvideoToplaylist = asynchandller(async(req,res)=>{
    const { playlistid, videoid } = req.query

    if(!isValidObjectId(playlistid) && !isValidObjectId(videoid)){
        res.json('invalid video or playlist id')
    }

    const pushvideo = await Playlist.findByIdAndUpdate(
        playlistid,
        {
            $push:{
                video:videoid
            }
        },{
            new:true
        }
    )

    if(!pushvideo){
        res.json('oops! some issues')
    }

    return res.json({pushvideo, message:'video add successfully'})
})

export const removevideoFromplaylist = asynchandller(async(req,res)=>{
    const { playlistid,videoid} = req.query

    if(!isValidObjectId(playlistid) && !isValidObjectId(videoid)){
        res.json('invalid playlist or video id')
    }
    const removevideo = await Playlist.findByIdAndUpdate(playlistid,{$pull:{video:videoid}},{new:true})
    if(!removevideo){
        res.json('oops! some issues')
    }

    return res.json('Remove video successfully')
})

export const deleteplaylist = asynchandller(async(req,res)=>{
    const {playlistid} = req.params

    if(!isValidObjectId(playlistid)){
        res.json('invalid playlist id')
    }
    const deleteplaylist = await Playlist.findByIdAndDelete(playlistid)

    return res.json('playlist delete successfully')
})

export const movevideoCurrentToOther = asynchandller(async(req,res)=>{
    const { fromplaylistid, videoid, toplaylistid} = req.query

    // if(!isValidObjectId({ fromplaylistid, videoid, toplaylistid})){
    //     res.json('invaild ids plz enter valid ids')
    // }

    const findcurrentplaylist =  await Playlist.findById(fromplaylistid)
    const currentplaylistname = findcurrentplaylist.title

    if(findcurrentplaylist){
        const removevideoFromcurrentplaylist = await Playlist.findByIdAndUpdate(
            fromplaylistid,
            {
                $pull:{
                    video:videoid
                }
            },
            {
                new:true
            }
        )
    }
    else{
        res.json('sorry, playlist not found')
    }
    
    const toplaylist = await Playlist.findById(toplaylistid)
    const toplaylistname = toplaylist.title

    if(toplaylist){
        const savevideoToplaylist = await Playlist.findByIdAndUpdate(
            toplaylistid,
            {
                $push:{
                    video:videoid
                }
            },
            {
                new:true
            }
        )
        if(!savevideoToplaylist){
            res.json('some issues present')
        }
    }
    else{
        res.json('sorry, playlist not found')
    }

    return res.json(` Move video from ${currentplaylistname} to ${toplaylistname} successfully`)
})

export const getuserplaylist = asynchandller(async(req,res)=>{
    const { userid } = req.params

    if(!isValidObjectId(userid)){
        res.json('invaild user id')
    }

    const playlistvideos = await Playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userid)
            }
        },
        {
            $lookup:{
                from:'videos',
                localField:'video',
                foreignField:'_id',
                as:'videos',
                pipeline:[
                    {
                        $project:{
                            thumbnail:1,
                            view:1
                        }
                    }
                ]
            }
        },
        {
            $unwind:'$owner'
        },
        {
            $project:{
                title:1,
                owner:1,
                thumbnail:1,
                videocount:1,
                thumbnail:{
                    $first:'$videos.thumbnail'
                },
                videocount:{
                    $size:'$videos'
                }
            }
        }

    ])

    if(!playlistvideos){
        res.json(' playlist not create')
    }

    return res.json({playlistvideos, message:"get user's playlist"})
})

export const getplaylistByid = asynchandller(async(req,res)=>{
    const { playlistid} = req.params

    if(!isValidObjectId(playlistid)){
        res.json('invaild playlistid')
    }

    const playlistvideo =  await Playlist.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(playlistid)
            }
        },
        {
            $lookup:{
                from:'videos',
                localField:'video',
                foreignField:'_id',
                as:'videos',
                pipeline:[
                    {
                        $match:{
                            ispublished:true
                        }
                    },
                    {
                        $lookup:{
                            from:'users',
                            localField:'owner',
                            foreignField:'_id',
                            as:'owner',
                            pipeline:[
                                {
                                    $project:{
                                        username:1,
                                        avtar:1
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        },
        {
            $project:{
                title:1,
                thumbnail:1,
                videos:1,
                owner:1,
                videocount:1,
                thumbnail:{
                    $first:'$videos.thumbnail'
                },
                videocount:{
                    $size:'$videos'
                }
            }
        }
    ])

    return res.json({playlistvideo, message:'get playlist by id'})
})