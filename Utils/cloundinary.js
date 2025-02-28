import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'

cloudinary.config({
    cloud_name: 'dzxjls5m4',
    api_key: '859318142278234',
    api_secret: 'fBXuJhuL0BLD9ouj3GovB7PW4QI' // Click 'View API Keys' above to copy your API secret
});
export const uploadphotooncloudinary = async (localfilepath) => {
    try {
        const responsepic = await cloudinary.uploader.upload(localfilepath, { resource_type: "auto", folder: 'photos' })
        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }
        return responsepic
    }
    catch (error) {
        return null
    } finally {
        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }
    }
}

export const uploadvideooncloudinary = async (localfilepath) => {
    try {
        const responseVideo = await cloudinary.uploader.upload(localfilepath, { resource_type: "video", folder: 'videos' })
        // if (response.resource_type === 'video') {
        //     const videodetail = await cloudinary.api.resource(response.public_id,{
        //         resource_type: 'video',
        //         type:'upload',
        //         crop: "fill",
        //         format: "mp4",
        //     })
        //     var duration = videodetail.duration
        // }
        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }
        return responseVideo
    } catch (error) {
        return null
    } finally {
        if (fs.existsSync(localfilepath)) {
            fs.unlinkSync(localfilepath);
        }
    }
}

