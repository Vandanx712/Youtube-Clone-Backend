import { User } from "../Models/user.model.js";

export const generateAccessandRefreshtToken = async (userId) => {

    try {
        const user = await User.findById(userId)
        const accesstoken = user.generaAccesstetoken()
        const refreshtoken = user.generaRefreshtetoken()
        
        user.refreshtoken = refreshtoken
        await user.save({ validateBeforeSave: false })

        return {accesstoken,refreshtoken}

    } catch (error) {
        console.log(error);
    }

}