import { Router } from "express";
import {registeruser,loginuser, logoutuser, refreshAccesstoken,updatepassword, updateuseravtar, updateAccoutdetail, getcurrentuser, getuserchannel, getwatchhistory, registeradmin, registersuperadmin, updateuserRole, verifyotp, deletechannel} from "../Controllers/usercontroller.js";
import upload from '../Middlewares/multer.js'
import { verifyjwt } from "../Middlewares/auth.js";
import verifyroles from "../Middlewares/verifyRoles.js";

const router = Router()


router.route('/register').post(upload.single('avtar'), registeruser)
router.route('/registeradmin').post(upload.single('Aavtar'), registeradmin) // register for admin
router.route('/superadmin').post(upload.single('Savtar'),registersuperadmin) // register for superadmin
router.route('/login').post(loginuser)   // direct login for admin or superadmin and otp for user
router.route('/verifyotp').post(verifyotp)
router.route('/logout').post( verifyjwt, logoutuser)
router.route('/refreshtoken').post(refreshAccesstoken)
router.route('/updatepassword').patch(verifyjwt,updatepassword)
router.route('/updateavtar').patch(verifyjwt,upload.single('avtar'),updateuseravtar)
router.route('/updateaccountdetail').post(verifyjwt,updateAccoutdetail)
router.route('/updateuserrole').patch(verifyjwt, verifyroles(['admin','Super_admin']),updateuserRole)
router.route('/getuser').get(verifyjwt,getcurrentuser)
router.route('/:username').get(verifyjwt,getuserchannel)
router.route('/watchhistory').get(verifyjwt,getwatchhistory)


router.route('/deleteaccount').delete(verifyroles['admin','Super_admin'],deletechannel)  // only admins & superadmins are delete userchannel 

export default router