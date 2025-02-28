import { Router } from "express";
import { verifyjwt } from "../Middlewares/auth.js";
import { subscribechannel } from "../Controllers/subscriptioncontroller.js";

const router = Router()


router.route('/subornot').get(verifyjwt , subscribechannel)


export default router