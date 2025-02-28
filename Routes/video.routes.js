import {Router} from "express";
import upload from "../Middlewares/multer.js";
import { verifyjwt } from "../Middlewares/auth.js";

import { deletevideo, getallvideo, getvideobyid, uploadvideo } from "../Controllers/videocontroller.js";
import verifyroles from "../Middlewares/verifyRoles.js";

const router = Router()


router.route('/uploadvideo').post(verifyjwt,upload.fields([{name:'video',maxCount:1},{name:'thumbnail',maxCount:1}]),uploadvideo)
router.route('/:videoid').get(verifyjwt,getvideobyid)
router.route('/channelvideos/:userid').get(getallvideo)
router.route('/:videoid').delete(verifyjwt || verifyroles['admin','Super_admin'],deletevideo)

export default router