import { Router } from "express";
import userrouter from "./Routes/user.routes.js";
const router = Router()
router.route("/users",userrouter)

export default router