import { Router } from "express";
import { verifyjwt } from "../Middlewares/auth.js";
import { addvideoToplaylist, createplaylist, deleteplaylist, getplaylistByid, getuserplaylist, movevideoCurrentToOther, removevideoFromplaylist } from "../Controllers/playlistcontroller.js";


const router = Router()

router.route('/createplaylist').post( verifyjwt, createplaylist)
router.route('/addvideo').get(verifyjwt,addvideoToplaylist)
router.route('/removevideo').get( verifyjwt, removevideoFromplaylist)
router.route('/:playlistid').delete( verifyjwt,deleteplaylist)
router.route('/movevideo').get( verifyjwt, movevideoCurrentToOther)
router.route('/:userid').get(verifyjwt, getuserplaylist)
router.route('/playlist/:playlistid').get(verifyjwt,getplaylistByid)


export default router