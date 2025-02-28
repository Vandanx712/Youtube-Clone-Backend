import { asynchandller } from "../Utils/asynchandller.js";
import { User } from "../Models/user.model.js";

const verifyroles = (roles = []) => asynchandller(async(req,res,next) => {
    if(!req.user._id){
        res.json('unauthorized request')
    }
    const user = await User.findById(req.user._id)
    if(!user){
        res.json('user not found')
    }
    if(roles.includes(user.roles)){
        next()
    }
    else{
        res.json('you are not allowed to perform this action')
    }
})

export default verifyroles
