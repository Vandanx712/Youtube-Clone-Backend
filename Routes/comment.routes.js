import {Router} from 'express'
import { verifyjwt } from '../Middlewares/auth.js'
import { addcomment, deletecomment, updatecomment } from '../Controllers/commentcontroller.js'


const router = Router()

router.route('/:videoid').post(verifyjwt,addcomment)
router.route('/:commentid').delete(verifyjwt,deletecomment)
router.route('/:commentid').patch(verifyjwt, updatecomment)

export default router