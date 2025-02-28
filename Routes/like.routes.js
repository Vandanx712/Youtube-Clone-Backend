import {Router} from 'express'
import {verifyjwt} from '../Middlewares/auth.js'
import { getalllikedvideo, givelike } from '../Controllers/likecontroller.js'


const router = Router()

router.route('/likeornot').get(verifyjwt,givelike)
router.route('/userlikedvideo').get(verifyjwt,getalllikedvideo)


export default router