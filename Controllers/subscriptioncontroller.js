import { asynchandller } from "../Utils/asynchandller.js";
import { isValidObjectId } from "mongoose";
import { Subscription } from "../Models/subscription.model.js";
import { User } from "../Models/user.model.js";


export const subscribechannel = asynchandller(async (req, res) => {
    const { togglesubscribe, channelid } = req.query
    let reqsub
    let usersub
    let issubscribed
    const channel = await User.findById(channelid)
    const channelname = channel.username

    if (!isValidObjectId(channelid)) {
        res.json('invaild channel id')
    }
    if (togglesubscribe === 'true') reqsub = true
    else reqsub = false

    usersub = await Subscription.find({
        subscriber: req.user._id,
        channel: channelid
    })

    if (usersub.length > 0) {
        await Subscription.deleteOne({
            subscriber: req.user._id,
            channel: channelid
        })
        issubscribed = reqsub
    }
    else {
        const newsub = await Subscription.create({
            subscribe: req.user._id,
            channel: channelid
        })
        if (!newsub) {
            res.json('oops!,some issues')
        }
        issubscribed = reqsub
    }
    return res.json({ channelname, message: `${issubscribed ? 'subscribed successfully' : 'unsubscribed successfully'}` })
})