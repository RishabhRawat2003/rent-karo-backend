import { Router } from "express";
import { signup, login, googleLogin, googleSignup, getUser } from "../controllers/user.controller.js";
import { authenticateUser } from "../middlewares/authentication.middleware.js";

const router = Router();

router.post("/signup", signup);
router.post("/login", login);
router.post("/get-user", authenticateUser, getUser);
router.post("/google-auth", googleSignup);
router.post("/google-auth-sigin", googleLogin);



export default router;